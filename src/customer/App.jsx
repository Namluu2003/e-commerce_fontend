import React from 'react';

import CustomerTest from './CustomerTest';
import AddCustomer from './AddCustomer';
import UpdateCustomer from './UpdateCustomer';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<CustomerTest />} /> {/* Thay 'component' bằng 'element' */}
                <Route path="/add-customer" element={<AddCustomer />} />
                <Route path="/update-customer/:id" element={<UpdateCustomer />} />
            </Routes>
        </Router>
    );
};

export default App;




