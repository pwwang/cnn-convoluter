import React from 'react';

function DimensionalityRadio({value, disabled, dimty, dimtyChange}) {
    return <label className={"btn btn-primary " + (
            value === 1 ? 'active' : ''
        ) + (disabled ? ' disabled' : '')} onClick={disabled ? undefined : dimtyChange}
            data-dimty={value}>
        <input type="radio" name="dimty_options" className="form-control"
            autoComplete="off"
            disabled={disabled}
            checked={dimty === value}
            readOnly /> {value}D
    </label>
}

function SettingsInputDimensionality({dimty, dimtyChange, visual}) {

    return <div className="btn-group-sm btn-group-toggle input-dimensionality"
                data-toggle="buttons">
        {[1, 2, 3].map(val => <DimensionalityRadio
            key={"dimty" + val}
            value={val}
            disabled={val == 3 && visual}
            dimty={dimty}
            dimtyChange={dimtyChange}
        />)}
    </div>;
};

export default SettingsInputDimensionality;
