import { fslSc, mk } from './common'

const defineWorld7 = defineExped => {
  defineExped(41)(
    [
      ...fslSc(30,3),
      mk.LevelSum(100),
      mk.TotalAsw(210,true),
    ]
  )
  defineExped(42)(
    [
      ...fslSc(1,4),
    ]
  )
  defineExped(43)(
    [
      ...fslSc(1,6),
      mk.FSType('CVE'),
      mk.FleetCompo({CVE: 1, DD: 3}),
      mk.TotalAsw(280,true),
      mk.TotalFirepower(500),
    ]
  )
  defineExped(44)(
    [
      ...fslSc(1,6),
      mk.FleetCompo({CVLike: 2, AV: 1, CL: 1, DD: 2}),
      mk.DrumCarrierCount(3),
      mk.DrumCount(6),
    ]
  )
}

export { defineWorld7 }
