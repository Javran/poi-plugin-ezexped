import _ from 'lodash'
import React, { Component } from 'react'
import styled from 'styled-components'
import {
  ItemTemplate,
} from './common'
import { __ } from '../../../tr'
import { PTyp } from '../../../ptyp'

import { MinFleetCompo, computeKey } from './min-fleet-compo'
import { AnyFleetCompoTooltipContent } from './any-fleet-compo-tooltip-content'

const Well = styled.div`
  font-size: 100%;
  min-height: 20px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  border-radius: 1px;
  margin-top: .1em;
  margin-bottom: .2em;
  padding: .2em .2em;
`

class AnyFleetCompoItem extends Component {
  static propTypes = {
    result: PTyp.object.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      currentKey: null,
    }
  }

  handleChangeKey = newKey => () =>
    this.setState({currentKey: newKey})

  renderContent = () => {
    const {results} = this.props.result.extra
    const {sat} = this.props.result
    return (
      <div style={{display: 'flex', alignItems: 'center'}}>
        <div key="header">
          {__("Fleet Composition")}
          :
        </div>
        <div style={{
          marginLeft: '.5em',
          flex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {
            _.flatMap(
              results,
              (rs,ind) => {
                const key = computeKey(rs.extra.results)
                const keyPrefix = `${key}-`
                /*
                   change key when moving over this component or
                   focusing on it. onBlur and onMouseOut is intentionally
                   left unset, so that most of the time it will have a focused
                   fleet composition to show
                 */
                const content = (
                  <Well
                    onMouseOver={this.handleChangeKey(key)}
                    onFocus={this.handleChangeKey(key)}
                    key={`${keyPrefix}content`}
                  >
                    <MinFleetCompo
                      style={{
                        marginLeft: 0,
                        marginRight: 0,
                      }}
                      between=".2em"
                      noDanger={sat}
                      stypeInfoList={rs.extra.results}
                    />
                  </Well>
                )
                if (ind+1 !== results.length) {
                  return [
                    content,
                    <span
                      key={`${keyPrefix}sep`}
                      style={{
                        marginLeft: '.4em',
                        marginRight: '.4em',
                      }}>
                      or
                    </span>,
                  ]
                } else {
                  return [content]
                }
              })
          }
        </div>
      </div>
    )
  }

  renderTooltip = () => {
    const {result} = this.props
    return (
      <div>
        <AnyFleetCompoTooltipContent
          noDanger={result.sat}
          currentKey={this.state.currentKey}
          fleetCompos={result.extra.results}
        />
      </div>
    )
  }

  render() {
    return (
      <ItemTemplate
        content={this.renderContent()}
        tooltip={this.renderTooltip()}
        {...this.props}
      />
    )
  }
}

export { AnyFleetCompoItem }
