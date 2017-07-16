import React, { Component } from 'react'

import {
  Panel,
} from 'react-bootstrap'

import { join } from 'path-extra'

import { FleetPicker } from './fleet-picker'
import { ExpeditionViewer } from './expedition-viewer'
import { ExpeditionTable } from './expedition-table'
import { RequirementViewer } from './requirement-viewer'

import { loadAndUpdateConfig } from '../config'

import {
  findChangingFleet,
  findNextAvailableFleet,
  isSendingFleetToExped,
} from '../auto-switch'

import { modifyObject } from '../utils'
import { PTyp } from '../ptyp'

class EZExpedMain extends Component {
  static propTypes = {
    redux: PTyp.shape({
      fleetInd: PTyp.number,
    }).isRequired,
    fleets: PTyp.array.isRequired,
    fleetAutoSwitch: PTyp.bool.isRequired,
    isFleetCombined: PTyp.bool.isRequired,
    selectedExpeds: PTyp.objectOf(PTyp.number).isRequired,
    gsFlags: PTyp.objectOf(PTyp.bool).isRequired,
    hideMainFleet: PTyp.bool.isRequired,
    sparkledCount: PTyp.number.isRequired,
    hideSatReqs: PTyp.bool.isRequired,
    changeFleet: PTyp.func.isRequired,
    configReady: PTyp.func.isRequired,
    modifyState: PTyp.func.isRequired,
  }

  constructor() {
    super()
    this.state = {
      expedGridExpanded: false,
    }
  }

  componentDidMount() {
    setTimeout(() => loadAndUpdateConfig(this.props.configReady))
    window.addEventListener('game.response', this.handleGameResponse)
  }

  componentWillReceiveProps(nextProps) {
    const { changeFleet } = nextProps
    const nextCurrentFleet = nextProps.redux.fleetInd !== null
      && nextProps.fleets.find( fleet => fleet.index === nextProps.redux.fleetInd )

    if (!nextCurrentFleet) {
      // current focus is null, we need to find a new focus
      if (nextProps.fleets.length > 0) {
        changeFleet(
          nextProps.fleets[0].index,
          "initializing fleet focus")
      }
      return
    }

    if (nextProps.fleetAutoSwitch
        && this.props.fleets.length === nextProps.fleets.length) {
      const changingFleetInd = findChangingFleet(
        this.props.fleets,
        nextProps.fleets)
      if (changingFleetInd !== null) {
        changeFleet(
          changingFleetInd,
          "detected changing fleet")
      }

      if (isSendingFleetToExped(
        this.props.fleets,
        nextProps.fleets,
        nextProps.isFleetCombined)) {
        const nxt = findNextAvailableFleet(
          nextProps.fleets,
          nextProps.isFleetCombined)

        if (nxt !== null) {
          changeFleet(
            nxt,
            "detected that we are sending a fleet out, switching to next one")
        } else {
          // nxt === null
          if (! nextProps.hideMainFleet && nextProps.fleets.length > 0) {
            changeFleet(
              nextProps.fleets[0].index,
              "all fleets are sent, switching to main fleet")
          }
        }
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('game.response', this.handleGameResponse)
  }

  handleGameResponse = e => {
    const path = e.detail.path
    if (this.props.fleetAutoSwitch) {
      if (path === "/kcsapi/api_get_member/mission") {
        const nxt = findNextAvailableFleet(
          this.props.fleets,
          this.props.isFleetCombined,
          this.props.hideMainFleet)
        if (nxt !== null) {
          this.props.changeFleet(nxt, "User is at expedition screen")
        } else {
          // nxt === null
          if (! this.props.hideMainFleet && this.props.fleets.length > 0) {
            this.props.changeFleet(
              this.props.fleets[0].index,
              "at exped screen, no fleet available, switching to main")
          }
        }
      }
    }
  }

  selectExped = newExpedId => {
    const fleetInd = this.props.redux.fleetInd
    this.setState({ expedGridExpanded: false })
    this.props.modifyState(
      modifyObject(
        'selectedExpeds',
        modifyObject(fleetInd, () => newExpedId)))
  }

  render() {
    const { fleetInd } = this.props.redux
    const { selectedExpeds, gsFlags } = this.props
    const expedId = selectedExpeds[fleetInd]
    const gsFlag = gsFlags[expedId]
    const fleet = this.props.fleets.find(flt => flt.index === fleetInd) || null
    return (
      <div className="poi-plugin-ezexped">
        <link rel="stylesheet" href={join(__dirname, '..', 'assets', 'ezexped.css')} />
        <div style={{paddingRight: "5px", paddingLeft: "5px"}}>
          <FleetPicker
              fleets={this.props.fleets}
              fleetInd={fleetInd}
              selectedExpeds={selectedExpeds}
              gsFlags={gsFlags}
              isFleetCombined={this.props.isFleetCombined}
              autoSwitch={this.props.fleetAutoSwitch}
              recommendSparkled={this.props.sparkledCount}
              onToggleAutoSwitch={() =>
                this.props.modifyState(
                  modifyObject(
                    'fleetAutoSwitch',
                    x => !x))
              }
              onSelectFleet={this.props.changeFleet} />
          {
            fleet && (
              <ExpeditionViewer
                expedId={expedId}
                fleet={fleet}
                greatSuccess={gsFlag}
                onClickExped={() =>
                  this.setState({expedGridExpanded: !this.state.expedGridExpanded})}
                onClickGS={() =>
                  this.props.modifyState(
                    modifyObject(
                      'gsFlags',
                      modifyObject(
                        expedId,
                        x => !x)))
                }
              />
            )
          }
          {
            fleet && (
              <Panel
                collapsible
                expanded={this.state.expedGridExpanded}
                style={{marginBottom: "5px"}} >
                <ExpeditionTable
                  fleet={fleet}
                  expedId={expedId}
                  onSelectExped={this.selectExped} />
              </Panel>
            )
          }
          {
            fleet && (
              <RequirementViewer
                fleet={fleet}
                expedId={expedId}
                greatSuccess={gsFlag}
                recommendSparkled={this.props.sparkledCount}
                hideSatReqs={this.props.hideSatReqs}
              />
            )
          }
        </div>
      </div>
    )
  }
}

export {
  EZExpedMain,
}
