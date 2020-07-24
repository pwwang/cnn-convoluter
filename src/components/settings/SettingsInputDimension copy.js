import React from 'react';
import SettingsDimension from './SettingsDimension';

function SettingsInputDimension(props) {

    return <SettingsDimension dimty={props.dimty}
        values={props.values}
        onChange={props.inDimChange} />;
};

export default SettingsInputDimension;
