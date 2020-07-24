import React, { useState } from 'react';

function DimensionalityRadio(props) {
    return <label className={"btn btn-primary " + (
            props.value === 1 ? 'active' : ''
        )} onClick={props.dimtyChange} data-dimty={props.value}>
        <input type="radio" name="dimty_options" className="form-control"
            autoComplete="off"
            checked={props.dimty === props.value}
            readOnly /> {props.value}D
    </label>
}

function SettingsInputDimensionality(props) {

    return <div className="btn-group-sm btn-group-toggle input-dimensionality"
                data-toggle="buttons">
        {[1, 2, 3].map(val => <DimensionalityRadio
            key={"dimty" + val}
            value={val}
            dimty={props.dimty}
            dimtyChange={props.dimtyChange}
        />)}
    </div>;
};

export default SettingsInputDimensionality;
