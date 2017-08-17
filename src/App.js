import React from 'react';
import { jsonServerRestClient, Admin, Resource, Delete } from 'admin-on-rest';

import './App.css';
import { PostList, PostEdit, PostCreate } from './posts';
import { UserList } from './users';
import ShowConfig from './config';
import PostIcon from 'material-ui/svg-icons/action/book';
import UserIcon from 'material-ui/svg-icons/social/group';

const App = () => (
	<Admin restClient={jsonServerRestClient('http://jsonplaceholder.typicode.com')}>
		<Resource name="posts" list={PostList} edit={PostEdit} create={PostCreate} remove={Delete} icon={PostIcon}/>
		<Resource name="users" list={UserList} icon={UserIcon}/>
		<Resource name="config" list={ShowConfig}/>
	</Admin>
);

export default App;
