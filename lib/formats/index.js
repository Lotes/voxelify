'use strict'

const Keys = require('./Keys')
const Container = require('./Container')
const fs = require('fs')
const path = require('path')
const validate = require('jsonschema').validate
const semver = require('semver')

//returns all files and folders for a given path
function split(rootPath) {
  let files = []
  let folders = []
  let result = {
    files: files,
    folders: folders
  }
  let fileNames = fs.readdirSync(rootPath)
  fileNames.forEach(fn => {
    let stat = fs.statSync(path.join(rootPath, fn))
    if(stat.isDirectory()) {
      folders.push(fn)
    } else if(stat.isFile()) {
      files.push(fn)
    }
  })
  return result
}

const validatorPattern = /^([a-z_]+)\.validators\.js$/
const schemaPattern = /^([a-z_]+)\.schema\.json$/
const migratorPattern = /^([a-z_\d\.]+)\.migrator\.js$/
const formatPattern = /^([a-z_]+)-(\d+\.\d+\.\d+)$/

//scans a set of files for validators and schemas and adds them to a given list; also scans for migrators
function scanForValidatorsAndMigrators(rootPath, fileNames, validators, migratorMap) {
  fileNames.forEach(fn => {
    //validators
    let fullFileName = path.join(rootPath, fn)
    let matchValidator = validatorPattern.exec(fn)
    if(matchValidator !== null) {
      let validator = require(fullFileName)
      validators.push(validator)
      return
    }

    //schemas
    let matchSchema = schemaPattern.exec(fn)
    if(matchSchema !== null) {
      let key = matchSchema[1]
      let schema = require(fullFileName)
      let validator = (container) => {
        if (!validate(container.getMetaObject(key), schema).valid) {
          throw new Error('Meta object `' + key + '` is not valid!')
        }
      }
      validators.push(validator)
      return
    }

    if(migratorMap === null)
      return

    //migrators
    let matchMigrator = migratorPattern.exec(fn)
    if (matchMigrator !== null) {
      let version = matchMigrator[1]
      let migrator = require(fullFileName)
      migratorMap.set(version, migrator)
    }
  })
}

//read in all formats and validators
const FormatCollection = {
  Validators: [],
  Formats: new Map()
}
const rootDir = split(__dirname)
scanForValidatorsAndMigrators(__dirname, rootDir.files, FormatCollection.Validators, null)
const Formats = FormatCollection.Formats
rootDir.folders.forEach(folder => {
  let Format = {
    Validators: [],
    Versions: new Map()
  }
  Formats.set(folder, Format)
  let fullFolderPath = path.join(__dirname, folder)
  let formatDir = split(fullFolderPath)
  scanForValidatorsAndMigrators(fullFolderPath, formatDir.files, Format.Validators, null)
  formatDir.folders.forEach(version => {
    if(!semver.valid(version)) {
      throw new Error('`' + version + '` is not a valid semantic version!')
    }
    let versionValidators = []
    let fullVersionFolderPath = path.join(fullFolderPath, version)
    let versionDir = split(fullVersionFolderPath)
    let migratorMap = new Map()
    scanForValidatorsAndMigrators(fullVersionFolderPath, versionDir.files, versionValidators, migratorMap)
    Format.Versions.set(version, {
      Validators: versionValidators,
      Migrators: migratorMap
    })
  })
})

function getContainerFormatVersion(container) {
  let model = container.getMetaObject(Keys.ModelKey)
  if(model === null) {
    throw new Error('Meta object `'+Keys.ModelKey+'` required!')
  }
  let formatId = model.format
  if(!formatId) {
    throw new Error('`format` attribute required!')
  }
  let formatMatch = formatPattern.exec(formatId)
  if(formatMatch === null) {
    throw new Error('Wrong syntax for `format` attribute')
  }
  let formatName = formatMatch[1]
  let version = formatMatch[2]
  return {
    name: formatName,
    version: version
  }
}

//throws an exception when one validator fails
function checkContainer(container) {
  let formatVersion = getContainerFormatVersion(container)
  let formatName = formatVersion.name
  let version = formatVersion.version
  let rootValidators = FormatCollection.Validators
  if(!FormatCollection.Formats.has(formatName)) {
    throw new Error('Unknown format `'+formatName+'`!')
  }
  let Format = FormatCollection.Formats.get(formatName)
  let formatValidators = Format.Validators
  if(!Format.Versions.has(version)) {
    return new Error('Unknown format version `'+formatId+'`!')
  }
  let Version = Format.Versions.get(version)
  let versionValidators = Version.Validators
  let validators = Array.concat(rootValidators, formatValidators, versionValidators)
  validators.forEach(validator => validator(container))
}

//upgrades a container to the newest format
function upgrade(container) {
  let formatVersion = getContainerFormatVersion(container)
  let formatName = formatVersion.name
  let version = formatVersion.version

  //get migrator
  if(!FormatCollection.Formats.has(formatName)) {
    throw new Error('Unknown format `'+formatName+'`!')
  }
  let Format = FormatCollection.Formats.get(formatName)
  if(!Format.Versions.has(version)) {
    return new Error('Unknown format version `'+formatId+'`!')
  }
  let Version = Format.Versions.get(version)
  let migrators = Version.Migrators
  let bestKey = version
  let bestMigrator = null
  migrators.forEach((migrator, key) => {
    if(semver.gt(key, bestKey)) {
      bestKey = key
      bestMigrator = migrator
    }
  })
  if(bestMigrator === null) {
    return container
  } else {
    let newContainer = bestMigrator(container)
    checkContainer(newContainer)
    return newContainer
  }
}

//returns Promise<Container>
function load(buffer) {
  let container = new Container()
  return container.load(buffer)
    .then(() => {
      checkContainer(container)
      return upgrade(container)
    })
}

//returns Promise<Buffer>
function save(container) {
  checkContainer(container)
  return container.save()
}