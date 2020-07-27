import React from 'react';
import SettingsDimension from './SettingsDimension';

function SettingsInputDimension({dimty, inDimChange, values}) {

    return <SettingsDimension dimty={dimty}
        values={values}
        onChange={inDimChange} />;
};

export default SettingsInputDimension;
