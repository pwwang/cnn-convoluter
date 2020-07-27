import React from 'react';

function SettingsAutoWalker({status, onClick}) {
    return <div>
        <button className="btn btn-primary btn-sm"
            onClick={onClick}>
            {status ? 'Stop' : 'Start'}
        </button>
    </div>;
}

export default SettingsAutoWalker;
