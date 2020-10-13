import { fslSc, mk } from './common'

const defineWorld7 = defineExped => {
  defineExped(41)(
    [
      ...fslSc(30,3),
      mk.LevelSum(115),
      mk.FleetCompo({DDorDE: 3}),
      mk.TotalAsw(210, true),
      mk.TotalAntiAir(80),
    ]
  )
  defineExped(42)(
    [
      ...fslSc(45,4),
      mk.LevelSum(200),
      mk.AnyFleetCompo([
        {CVE: 1, DDorDE: 3},
        {CL: 1, DDorDE: 3},
        {CT: 1, DDorDE: 3},
      ]),
    ]
  )
  defineExped(43)(
    [
      ...fslSc(55,6),
      mk.LevelSum(300),
      mk.FSType('CVE'),
      mk.FleetCompo({CVE: 1, DDorDE: 2}),
      mk.TotalFirepower(500),
      mk.TotalAsw(280, true),
    ]
  )
  defineExped(44)(
    [
      ...fslSc(45,6),
      mk.FleetCompo({
        /*
           The actual condition is 2CVL 1AV 1CL 2DD.
           However, since AV also counts as CV-like,
           this brings total CL-like to 3 rather than 2.
         */
        CVLike: 3,
        AV: 1,
        CL: 1,
        DD: 2,
      }),
      mk.DrumCarrierCount(3),
      mk.DrumCount(6),
      mk.TotalAsw(200, true),
    ]
  )
  defineExped(45)([
    ...fslSc(50,5),
    mk.LevelSum(240),
    mk.FleetCompo({
      CVL: 1,
      DDorDE: 4,
    }),
    mk.FSType('CVL'),
    mk.TotalAntiAir(240),
    // TODO: to be confirmed.
    mk.TotalAsw(300, true),
    mk.TotalLos(180),
  ])
  defineExped(46)([
    ...fslSc(60,5),
    mk.LevelSum(300),
    mk.FleetCompo({
      CA: 2,
      CL: 1,
      DD: 2,
    }),
    mk.TotalFirepower(350),
    mk.TotalAntiAir(300),
    mk.TotalAsw(220, true),
    mk.TotalLos(200),
  ])
}

export { defineWorld7 }
