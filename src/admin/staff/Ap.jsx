import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Staff from './Staff'; // Your Staff component
import AddStaff from './AddStaff'; // Component to add staff
import EditStaff from './EditStaff'; // Component to edit staff

function Ap() {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={Staff} />
                <Route path="/add-staff" component={AddStaff} />
                <Route path="/edit-staff/:id" component={EditStaff} />
            </Switch>
        </Router>
    );
}

export default Ap;