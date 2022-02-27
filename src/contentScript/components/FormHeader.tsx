import React from 'react';

const FormHeader = () => {
    return (
        <div className='header'>
            <span className='gaspricetitle'> ETH Mid Gas Price: </span>
            <br />
            <span className='gasprice'>  73 Gwei, $3.84 USD </span>
        </div>
    );
};

export default FormHeader;