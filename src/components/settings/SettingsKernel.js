import React from 'react';
import SettingsDimension from './SettingsDimension';

function SettingsKernel({dimty, kernel, kernelChange}) {

    return <div>
        {Object.keys(kernel).map(
            (what) => <div key={what}>
                <small>{what.charAt(0).toUpperCase() + what.slice(1)}:</small>
                <SettingsDimension dimty={dimty}
                    values={kernel[what]}
                    onChange={(e) => kernelChange(what, e)} />
            </div>
        )}
    </div>;
};

export default SettingsKernel;
