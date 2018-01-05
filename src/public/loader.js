'use strict'

let loadingCounter = 0

const loader = {
  disable: () => {
    loadingCounter--
    if (loadingCounter == 0)
      document.getElementById('wrapper').style.display = 'none'
  },
  dataLoading: () => {
    loadingCounter++
    const wrapper = document.getElementById('wrapper')
    wrapper.style.display = 'block'
    wrapper.className = 'data-loading'
    wrapper.firstElementChild.className = 'loader'
  },
  buildingTable: () => {
    loadingCounter++
    const wrapper = document.getElementById('wrapper')
    wrapper.style.display = 'block'
    wrapper.className = ''
    wrapper.firstElementChild.className = 'loader'
  }
}