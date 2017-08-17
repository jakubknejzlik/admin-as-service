import React from 'react';
import { Show, SimpleShowLayout } from 'admin-on-rest';
import axios from "axios";
import yaml from "js-yaml";

class ShowConfig extends React.Component {
	constructor(props){
		super(props);

		let dataUrl = "";
		if(process.env.REACT_APP_CONFIG){
			try{
				dataUrl = require( process.env.REACT_APP_CONFIG);
			}catch (err){
				console.error(err);
			}
		} else {
			// console.log(require( './example/simple.config.yml'));
			dataUrl = require('./example/simple.config.yml');
		}

		this.state = {
			config: "",
			dataUrl: dataUrl
		}

		axios
			.get(dataUrl)
			.then((result) => {
				const jsObject = yaml.safeLoad(result.data);
				this.setState({
					config: JSON.stringify(jsObject)
				});
			});
	}

	render(){
		return (
			<span>
				<iframe style={{width: "100%", height: "100%"}} src={this.state.dataUrl}>
				</iframe>
			</span>
		);
	}
}

export default  ShowConfig;