'use strict'

const loader = {
  disable: () => {
    document.getElementById('wrapper').style.display = 'none'
  },
  dataLoading: () => {
    const wrapper = document.getElementById('wrapper')
    wrapper.style.display = 'block'
    wrapper.className = 'data-loading'
    wrapper.firstElementChild.className = 'loader'
  },
  buildingTable: () => {
    const wrapper = document.getElementById('wrapper')
    wrapper.style.display = 'block'
    wrapper.className = ''
    wrapper.firstElementChild.className = 'loader'
  }
}