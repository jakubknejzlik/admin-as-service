import React from 'react';
import { Show, SimpleShowLayout } from 'admin-on-rest';
import fs from 'fs';

import exampleConfig from './example/simple.config.yml';

// const content = fs.readFileSync(require('./example/simple.config.yml'));
if(process.env.REACT_APP_CONFIG){
	try{
		console.log(require( process.env.REACT_APP_CONFIG));
	}catch (err){
		console.error(err);
	}
} else {
	console.log(require( './example/simple.config.yml'));
}


export const ShowConfig = (props) => {
	<Show {...props}>
	</Show>
};