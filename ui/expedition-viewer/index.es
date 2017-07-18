import { createStructuredSelector } from 'reselect'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'

import { MaterialIcon } from 'views/components/etc/icon'

import { expedInfo } from '../../exped-info'
import { error, modifyObject } from '../../utils'
import { daihatsu, fleetResupplyCost } from '../../income-calc'

import { __, fmtTime } from '../../tr'
import { PTyp } from '../../ptyp'
import { mapDispatchToProps } from '../../store'

import { IconAndLabel } from './icon-and-label'
import { ResourceWithDetail } from './resource-with-detail'
import {
  expedIdSelector,
  fleetInfoSelector,
  gsFlagSelector,
} from '../../selectors'

const itemNameToMaterialId = x =>
    x === "Bucket" ? 6
  : x === "Flamethrower" ? 5
  : x === "DevMat" ? 7
  : x === "FCoinSmall" ? 10
  : x === "FCoinMedium" ? 11
  : x === "FCoinLarge" ? 12
  : error(`unknown item name: ${x}`)

// pretty-printing a floating number
const pprFloat = (v,digits=2) => v.toFixed(digits)

// pretty-printing a percentage
const pprAsPercent = (v,digits=2) => `${(v*100).toFixed(digits)}%`

const renderTexts = (rawIncome, greatSuccess, bonus, resupply) => {
  const basicIncome = greatSuccess ? Math.floor( rawIncome * 1.5 ) : rawIncome
  const basicIncomeText = basicIncome +
    (greatSuccess ? ` (=${rawIncome}x150%)` : "")

  const aveImpText = basicIncome > 0 && bonus.dhtCount > 0 &&
    `${pprFloat(bonus.impLvlCount / bonus.dhtCount)} (= ${bonus.impLvlCount}/${bonus.dhtCount})`

  const dhtBonus = Math.floor(basicIncome * (bonus.normalBonus + bonus.normalBonusStar))
  const dhtBonusText = basicIncome > 0 && (bonus.normalBonus > 0 || bonus.normalBonusStar > 0) &&
    `${dhtBonus} (=${basicIncome}x` +
    `(${pprAsPercent(bonus.normalBonus)}+` +
    `${pprAsPercent(bonus.normalBonusStar)}))`

  const tokuBonus = Math.floor(basicIncome * bonus.tokuBonus)
  const tokuBonusText = basicIncome > 0 && bonus.tokuBonus > 0 &&
    `${tokuBonus} (=${basicIncome}x${pprAsPercent(bonus.tokuBonus)})`

  const totalIncome = basicIncome + dhtBonus + tokuBonus
  const totalIncomeInnerText = [basicIncome,dhtBonus,tokuBonus].filter(x => x > 0).join("+")
  const totalIncomeText = basicIncome > 0 && basicIncome !== totalIncome &&
    `${totalIncome} (=${totalIncomeInnerText})`

  const netIncome = totalIncome - resupply
  const netIncomeText = resupply > 0 &&
    `${netIncome} (=${totalIncome}-${resupply})`

  return {
    basicIncomeText,
    aveImpText,
    dhtBonusText,
    tokuBonusText,
    totalIncomeText,
    netIncomeText,
    finalIncome: netIncome,
  }
}

const mkMat = matId => <MaterialIcon materialId={matId} className="material-icon" />

class ExpeditionViewerImpl extends Component {
  static propTypes = {
    expedId: PTyp.number.isRequired,
    greatSuccess: PTyp.bool.isRequired,
    fleet: PTyp.object.isRequired,
    modifyState: PTyp.func.isRequired,
  }

  handleClickExped = () =>
    this.props.modifyState(
      modifyObject(
        'expedTableExpanded',
        x => !x))

  handleToggleGS = () => {
    const {expedId, modifyState} = this.props
    modifyState(
      modifyObject(
        'gsFlags',
        modifyObject(
          expedId,
          x => !x)))
  }

  render() {
    const info = expedInfo[this.props.expedId]
    const resupplyCost =
      fleetResupplyCost(this.props.fleet.ships)(
        info.cost.fuelPercent / 100, info.cost.ammoPercent / 100)
    const daihatsuBonus =
      daihatsu.computeBonus(this.props.fleet.ships)

    // have to apply a semicolon otherwise parser won't recognize this properly
    const renderedResources = {};
    ["fuel","ammo","steel","bauxite"].map( resourceName => {
      const resupply =
        resourceName === "fuel" ? resupplyCost.fuelCost
        : resourceName === "ammo" ? resupplyCost.ammoCost
        : 0
      renderedResources[resourceName] = renderTexts(
        info.resource[resourceName],
        this.props.greatSuccess,
        daihatsuBonus,
        resupply)
    })

    const mkMatFromName = name => mkMat(itemNameToMaterialId( name ))
    const colFlexStyle = {
      display: "flex",
      justifyContent: "space-around",
      flexDirection: "column",
      marginLeft: "10px",
    }
    const hasNormalItem = info.itemNormal
    const hasGreatSuccessItem = this.props.greatSuccess && info.itemGreatSuccess
    const prettyRange = (x,y) => x === y ? `${x}` : `${x}~${y}`
    return (
      <div style={{display: "flex", marginBottom: "5px"}}>
        <div style={{flex: "1", maxWidth: "50%", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
          <Button
            onClick={this.handleClickExped}>
            <div style={{
              textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}} >
              {`${this.props.expedId} ${info.name}`}
            </div>
          </Button>
          <div style={{textAlign: "center"}}>{fmtTime(info.timeInMin)}</div>
          <div style={{display: "flex"}}>
            <div style={{flex: "1", display: "flex", flexDirection: "column"}} >
              <IconAndLabel
                icon={mkMat(1)} label={`${info.cost.fuelPercent}%`} />
              <IconAndLabel
                  style={{flex: "2"}}
                  icon={hasNormalItem ? mkMatFromName(info.itemNormal.itemId) : "-"}
                  label={hasNormalItem ? prettyRange(0,info.itemNormal.itemMaxCount) : "-"} />

            </div>
            <div style={{flex: "1", display: "flex", flexDirection: "column"}} >
              <IconAndLabel
                  icon={mkMat(2)} label={`${info.cost.ammoPercent}%`} />
              <IconAndLabel
                  style={{flex: "2"}}
                  icon={hasGreatSuccessItem ? mkMatFromName(info.itemGreatSuccess.itemId) : "-"}
                  label={hasGreatSuccessItem ? prettyRange(1,info.itemGreatSuccess.itemMaxCount) : "-"} />
            </div>
          </div>
        </div>
        <div style={{display: "flex", maxWidth: "50%", flex: "1", flexDirection: "column"}}>
          <div style={{display: "flex", flex: "1"}}>
            <div style={{flex: "1", ...colFlexStyle}}>
              <ResourceWithDetail
                  resourceName="fuel"
                  icon={mkMat(1)} renderedResource={renderedResources.fuel} />
              <ResourceWithDetail
                  resourceName="ammo"
                  icon={mkMat(2)} renderedResource={renderedResources.ammo} />
            </div>
            <div style={{flex: "1", ...colFlexStyle}}>
              <ResourceWithDetail
                  resourceName="steel"
                  icon={mkMat(3)} renderedResource={renderedResources.steel} />
              <ResourceWithDetail
                  resourceName="bauxite"
                  icon={mkMat(4)} renderedResource={renderedResources.bauxite} />
            </div>
          </div>
          <Button
            style={{display: "flex"}}
            onClick={this.handleToggleGS}>
            <FontAwesome
              className={
                /*
                   always use dark theme, as button texts are white in light themes
                   but poi-ship-cond-53 is supposed to be applied on texts (which is dark)
                 */
                this.props.greatSuccess ? 'poi-ship-cond-53 dark' : ''
              }
              style={{marginRight: "5px", marginTop: "2px"}}
              name={this.props.greatSuccess ? "check-square-o" : "square-o"} />
            <div
              className={this.props.greatSuccess ? 'poi-ship-cond-53 dark' : ''}
              style={{
                flex: 1,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }} >
              {__("Great Success")}</div>
          </Button>
        </div>
      </div>
    )
  }
}

const uiSelector = createStructuredSelector({
  expedId: expedIdSelector,
  fleet: fleetInfoSelector,
  greatSuccess: gsFlagSelector,
})

const ExpeditionViewer = connect(
  uiSelector,
  mapDispatchToProps,
)(ExpeditionViewerImpl)

export { ExpeditionViewer }
