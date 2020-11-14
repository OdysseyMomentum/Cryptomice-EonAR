
import React, { Component } from 'react'
import { Link } from "react-router-dom";

class Details extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <div style={{width: "80%", marginLeft: "10%"}}>
			<Link to="/">
			  <button variant="outlined">
				back
			  </button>
			</Link>
			<br/>
			<h2>Scan result</h2>
			<p>Based on historical network of our machine learning algorithm this product is:</p>
			<div style={{ backgroundColor: "red", color: "white" }}>
				<p style={{ top:"50px", bottom:"50px" }}>Not compliant</p>
			</div>
			<p>Shipping Details</p>
			<table style={{ width: "100%" }}>
			<tr>Production facility<td></td><td>MSD Turkey</td></tr>
			<tr>Production of product<td></td><td>19 Oct 2020</td></tr>
			<tr>Shipping time<td></td><td>13 days</td></tr>
			<tr>Destination<td></td><td>Stockholm</td></tr>
			</table>
      </div>
    )
  }
}

export default Details
