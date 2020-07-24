import React from 'react';
import SettingsDimension from './SettingsDimension';

function SettingsKernel(props) {

    return <div>
        {Object.keys(props.kernel).map(
            (what) => <div key={what}>
                <small>{what.charAt(0).toUpperCase() + what.slice(1)}:</small>
                <SettingsDimension dimty={props.dimty}
                    values={props.kernel[what]}
                    onChange={(e) => props.kernelChange(what, e)} />
            </div>
        )}
    </div>;
};

export default SettingsKernel;
