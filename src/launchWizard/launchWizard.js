/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Retrieve vscode api - Doing this multiple times causes issues with the scripts
const vscode = acquireVsCodeApi()

// Function to update which checkbox is checked for the classpath, replace/action
function daffodilDebugClassAction(action) {
  switch (action) {
    case 'replace':
      document.getElementById('daffodilDebugClasspathReplace').checked = true
      document.getElementById('daffodilDebugClasspathAppend').checked = false
      break
    case 'append':
      document.getElementById('daffodilDebugClasspathReplace').checked = false
      document.getElementById('daffodilDebugClasspathAppend').checked = true
      break
  }
}

// Function to call extension to open file picker
function filePicker(id, description) {
  vscode.postMessage({
    command: 'openFilePicker',
    id: id,
    description: description,
  })
}

// Function to update select infoset output type
function updateInfosetOutputType() {
  var infosetSelectionBox = document.getElementById('infosetOutputType')
  var infosetSelectedValue =
    infosetSelectionBox.options[infosetSelectionBox.selectedIndex].value

  if (infosetSelectedValue === 'file') {
    document.getElementById('infosetOutputFilePathLabel').style =
      'margin-top: 10px; visibility: visible;'
  } else {
    document.getElementById('infosetOutputFilePathLabel').style =
      'visibility: hidden;'
  }
}

// Function to update select TDML action
function updateTDMLAction() {
  var tdmlSelectionBox = document.getElementById('tdmlAction')
  var tdmlSelectedValue =
    tdmlSelectionBox.options[tdmlSelectionBox.selectedIndex].value

  if (tdmlSelectedValue !== 'none') {
    document.getElementById('tdmlNameLabel').style =
      'margin-top: 10px; visibility: visible;'
    document.getElementById('tdmlDescriptionLabel').style =
      'margin-top: 10px; visibility: visible;'
  } else {
    document.getElementById('tdmlNameLabel').style = 'visibility: hidden;'
    document.getElementById('tdmlDescriptionLabel').style =
      'visibility: hidden;'
  }

  if (tdmlSelectedValue === 'generate') {
    document.getElementById('tdmlPath').style =
      'margin-top: 10px; visibility: visible;'
  } else {
    document.getElementById('tdmlPath').style = 'visibility: hidden;'
  }
}

// Function to update config selected, also display name input box if 'New Config' selected
function updateSelectedConfig() {
  var configSelectionBox = document.getElementById('configSelected')
  var configSelectedValue =
    configSelectionBox.options[configSelectionBox.selectedIndex].value

  if (configSelectedValue === 'New Config') {
    document.getElementById('nameLabel').style =
      'margin-top: 10px; visibility: visible;'
  } else {
    document.getElementById('nameLabel').style = 'visibility: hidden;'
  }

  let configIndex =
    configSelectedValue === 'New Config' ? -1 : configSelectionBox.selectedIndex

  vscode.postMessage({
    command: 'updateConfigValue',
    configIndex: configIndex,
  })
}

// Function for checking/unchecking a checkbox element
function check(elementId) {
  const element = document.getElementById(elementId)
  element.checked = element.checked ? false : true
}

// Function for saving the settings to a launch.json
function save() {
  var configSelectionBox = document.getElementById('configSelected')
  var configSelectedValue =
    configSelectionBox.options[configSelectionBox.selectedIndex].value
  var updateOrCreate =
    configSelectedValue === 'New Config' ? 'create' : 'update'
  const name =
    configSelectedValue === 'New Config'
      ? document.getElementById('name').value
      : configSelectedValue
  const data = document.getElementById('data').value
  const debugServer = parseInt(document.getElementById('debugServer').value)
  const infosetOutputFilePath = document.getElementById(
    'infosetOutputFilePath'
  ).value
  const infosetOutputType = document.getElementById('infosetOutputType').value
  const tdmlAction = document.getElementById('tdmlAction').value
  const tdmlName = document.getElementById('tdmlName').value
  const tdmlDescription = document.getElementById('tdmlDescription').value
  const tdmlPath = document.getElementById('tdmlPath').value
  const openHexView = document.getElementById('openHexView').checked
  const openInfosetDiffView = document.getElementById(
    'openInfosetDiffView'
  ).checked
  const openInfosetView = document.getElementById('openInfosetView').checked
  const program = document.getElementById('program').value
  const stopOnEntry = document.getElementById('stopOnEntry').checked
  const trace = document.getElementById('trace').checked
  const useExistingServer = document.getElementById('useExistingServer').checked

  var obj = {
    version: '0.2.0',
    configurations: [
      {
        request: 'launch',
        type: 'dfdl',
        name: name,
        program: program,
        data: data,
        debugServer: debugServer,
        infosetOutput: {
          type: infosetOutputType,
          path: infosetOutputFilePath,
        },
        tdmlConfig: {
          action: tdmlAction,
          name: tdmlName,
          description: tdmlDescription,
          path: tdmlPath,
        },
        trace: trace,
        stopOnEntry: stopOnEntry,
        useExistingServer: useExistingServer,
        openHexView: openHexView,
        openInfosetView: openInfosetView,
        openInfosetDiffView: openInfosetDiffView,
      },
    ],
  }

  vscode.postMessage({
    command: 'saveConfig',
    data: JSON.stringify(obj, null, 4),
    updateOrCreate: updateOrCreate,
  })
}

// Function to update config values in the webview
function updateConfigValues(config) {
  document.getElementById('name').value = config.name
  document.getElementById('data').value = config.data
  document.getElementById('debugServer').value = parseInt(config.debugServer)
  document.getElementById('infosetOutputFilePath').value = config.infosetOutput[
    'path'
  ]
    ? config.infosetOutput['path']
    : config.infosetOutputFilePath
  document.getElementById('infosetOutputType').value = config.infosetOutput[
    'type'
  ]
    ? config.infosetOutput['type']
    : config.infosetOutputType
  document.getElementById('tdmlAction').value = config.tdmlConfig['action']
    ? config.tdmlConfig['action']
    : config.tdmlAction
  document.getElementById('tdmlName').value = config.tdmlConfig['name']
    ? config.tdmlConfig['name']
    : config.tdmlName
  document.getElementById('tdmlDescription').value = config.tdmlConfig[
    'description'
  ]
    ? config.tdmlConfig['description']
    : config.tdmlDescription
  document.getElementById('tdmlPath').value = config.tdmlConfig['path']
    ? config.tdmlConfig['path']
    : config.tdmlPath
  document.getElementById('openHexView').checked = config.openHexView
  document.getElementById('openInfosetDiffView').checked =
    config.openInfosetDiffView
  document.getElementById('openInfosetView').checked = config.openInfosetView
  document.getElementById('program').value = config.program
  document.getElementById('stopOnEntry').checked = config.stopOnEntry
  document.getElementById('trace').checked = config.trace
  document.getElementById('useExistingServer').checked =
    config.useExistingServer
  updateInfosetOutputType()
  updateTDMLAction()
}

// Function for updating the classpath input box
function updateClasspath(message) {
  let action = ''

  if (
    document.getElementById('daffodilDebugClasspathAppend').checked &&
    !document.getElementById('daffodilDebugClasspathReplace').checked
  ) {
    action = 'append'
  } else {
    action = 'replace'
  }

  if (action === 'append') {
    let newValue = ''
    var filesToAdd = message.value.split(':')

    for (var i = 0; i < filesToAdd.length; i++) {
      if (
        !document
          .getElementById('daffodilDebugClasspath')
          .value.includes(filesToAdd[i])
      ) {
        newValue += filesToAdd[i] + ':'
      }
    }

    document.getElementById('daffodilDebugClasspath').value =
      newValue + document.getElementById('daffodilDebugClasspath').value
  } else {
    document.getElementById('daffodilDebugClasspath').value = message.value
  }
}

// Function that gets called by default to create and update the hex web view
;(function main() {
  // Listener for getting messages/data from the extension
  window.addEventListener('message', (event) => {
    const message = event.data

    switch (message.command) {
      case 'updateConfValues':
        updateConfigValues(message.configValues)
        break
      case 'dataUpdate':
        document.getElementById('data').value = message.value
        break
      case 'programUpdate':
        document.getElementById('program').value = message.value
        break
      case 'daffodilDebugClasspathUpdate':
        updateClasspath(message)
        break
    }
  })
})()
