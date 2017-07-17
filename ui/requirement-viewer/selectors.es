import _ from 'lodash'
import { createSelector } from 'reselect'

import { extSelector, mkFleetInfoSelector } from '../../selectors'
import { mapExpedReq } from '../../exped-reqs'

import { expedReqsStage2Selector } from '../../selectors/exped-reqs'

const selectedExpedsSelector = createSelector(
  extSelector,
  ext => ext.selectedExpeds)

const mkFleetEReqResultObjectSelector = fleetId => createSelector(
  selectedExpedsSelector,
  mkFleetInfoSelector(fleetId),
  expedReqsStage2Selector,
  (selectedExpeds,fleet,expedReqsStage2) => {
    const expedId = selectedExpeds[fleetId]
    const expedReqStage2 = expedReqsStage2[expedId]
    const ereqResultObj = mapExpedReq(
      obj => {
        const result = obj.stage2(fleet)
        return {
          ...obj,
          result,
        }
      }
    )(expedReqStage2)

    return ereqResultObj
  })

export {
  mkFleetEReqResultObjectSelector,
}