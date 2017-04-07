import React, { Component } from 'react'
import { 
  Button, 
  ButtonGroup,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap'

import { getExpedReqs, checkAllReq, collapseResults } from './requirement'
const { FontAwesome } = window

import { __ } from './tr'

// TODO: too much pure logic part embeded in rendering logic
// might consider just extracting them out.
// I'm suspecting this also lead to some wasted rendering.

// props:
// - fleetId: current selected fleet id
// - fleets: array of fleet representation
// - config: for looking up fleetId => expedId => greatSuccess
// - onSelectFleet: callback when a new fleet is selected
//   this callback should accept a fleet id
// - autoSwitch
// - onToggleAutoSwitch
// - recommendedSparkled
class FleetPicker extends Component {
  render() {
    const mkTooltip = fleetId => { 
      const fleet = this.props.fleets[fleetId]
      return (<Tooltip id={`fpfleet-${fleetId}`}>
        <div style={{display: "flex", flexDirection: "column"}}>
          {fleet.ships.map((ship,ind) =>
            <div key={ind}>
              {`${ship.name} (Lv. ${ship.level})`}
            </div>
           )}
        </div>
      </Tooltip>)
    }

    // Button color:
    // - available:
    //   - first fleet always green 
    //     (for combined fleet, second fleet is always green too)
    //   - if everything is satisfied: green
    //   - if just needs resupply: yellow
    //   - otherwise red
    // - not available: always blue
    const mkButton = fleetId => {
      const fleet = this.props.fleets[fleetId]
      const expedId = this.props.config.selectedExpeds[fleetId]
      const greatSuccess = this.props.config.gsFlags[expedId]
      
      const eR = getExpedReqs(expedId,true,true,this.props.recommendedSparkled)

      const resupplyReadyFlag = checkAllReq(eR.resupply)(fleet.ships)
      // without resupply
      const normReadyFlag = 
        collapseResults( checkAllReq( eR.norm )(fleet.ships) )

      const gsReadyFlag = 
        !greatSuccess ||
        (greatSuccess && collapseResults( checkAllReq( eR.gs )(fleet.ships) ))

      const bsStyle =
          fleetId === 0 ? "success"
        : this.props.combinedFlag !== 0 && fleetId === 1 ? "success"
        : !fleet.available ? "primary"
        : normReadyFlag && resupplyReadyFlag && gsReadyFlag ? "success"
        : normReadyFlag && gsReadyFlag ? "warning"
        : "danger"

      const focused = this.props.fleetId === fleetId

      return (<Button
          bsStyle={bsStyle}
          style={{
            marginRight: "5px", flex: "1", 
            opacity: focused ? "1" : "0.5",
            whiteSpace: "nowrap",
            width: "75px", overflow: "hidden"}}
          active={focused}
          onClick={() => this.props.onSelectFleet(fleetId)}>
        <div style={{textOverflow: "ellipsis", overflow:"hidden"}} >
          {fleet.name}
        </div>
      </Button>)
    }

    const tooltipAutoSwitch = (<Tooltip id="tt-auto-btn">{__("AutoTooltip")}</Tooltip>)
    return (
      <div style={{ 
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "5px",
      }}>
        <ButtonGroup style={{display: "flex", width: "80%"}}>
          {[0,1,2,3].map((x) =>
            <OverlayTrigger
                key={x}
                placement="bottom" overlay={mkTooltip(x)}> 
              {mkButton(x)}
            </OverlayTrigger>
           )}
        </ButtonGroup>
            <OverlayTrigger
                key="auto-fleet"
                placement="left" overlay={tooltipAutoSwitch}> 
              <Button 
                style={{display:"flex", minWidth: "40px"}}
                onClick={this.props.onToggleAutoSwitch}>
                <FontAwesome
                  style={{marginRight: "5px", marginTop: "2px"}}
                  name={this.props.autoSwitch? "check-square-o" : "square-o"} />
                <div style={{
                  flex: "1",
                  textOverflow: "ellipsis",
                  overflow:"hidden"}} >{__("Auto")}</div>
             </Button>
        </OverlayTrigger>
      </div>)}}

export { FleetPicker }
