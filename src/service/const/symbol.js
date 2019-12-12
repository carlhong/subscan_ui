const ring_icon = require('./../../assets/images/ring@2x.png')
const kton_icon = require('./../../assets/images/kton@2x.png')
const ksm_icon = require('./../../assets/images/ksm@2x.png')

export default [{
  name: 'darwinia',
  value: {
    balances: {
      value: "RING",
      icon: ring_icon
    },
    kton: {
      value: "KTON",
      icon: kton_icon
    },
    domain: {
      value: 'https://crayfish.subscan.io'
    }
  }
}, {
  name: 'kusama',
  value: {
    balances: {
      value: "KSM",
      icon: ksm_icon
    },
    kton: {
      value: "KTON",
      icon: kton_icon
    },
    domain: {
      value: 'https://kusama.subscan.io'
    }
  }
}]
