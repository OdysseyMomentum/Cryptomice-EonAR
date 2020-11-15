
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router-dom';

class Details extends Component {
  constructor (props) {
    super(props)
	console.log(props)
	this.serial = props.match.params.id
  }

  render () {
	 
    return (
      <div style={{ width: '80%', marginLeft: '10%' }}>
        <Link to='/'>
          <button variant='outlined'>
				back
          </button>
        </Link>
        <br />
        <h2>Scan result</h2>
        <p>Based on historical network of our machine learning algorithm this product is:</p>
        <div style={{ backgroundColor: 'red', color: 'white' }}>
          <p style={{ top: '50px', bottom: '50px' }}>Not compliant</p>
        </div>
		<p>Serial number</p>
		<p>{this.serial}</p>
        <p>Shipping Details</p>
        <table style={{ width: '100%' }}>
		<tbody>
          <tr>Production facility<td /><td>MSD Turkey</td></tr>
          <tr>Production of product<td /><td>19 Oct 2020</td></tr>
          <tr>Shipping time<td /><td>13 days</td></tr>
          <tr>Destination<td /><td>Stockholm</td></tr>
		</tbody>
        </table>
        <img src={process.env.PUBLIC_URL +'/gs1-resolver.jpg'} height='150px' />
      </div>
    )
  }
}

export default withRouter(Details)
