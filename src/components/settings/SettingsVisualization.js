import React from 'react';
import ReactTooltip from 'react-tooltip';

function SettingsVisualization({status, onClick}) {
    // status true for visualize
    // false for not
    return <div>
        <button type="button"
            className={"btn btn-primary btn-sm " + (status ? "" : "active")}
            data-toggle="button"
            data-tip="You can disable visualization for large dimension of input.<br />This also enables 3D dimentionality."
            autoComplete="off"
            onClick={onClick}>
            {status ? "No Visual, just dimension calculations." : "With visualization"}
        </button>
        <ReactTooltip effect="solid" place="top" multiline={true} />
    </div>;
}

export default SettingsVisualization;
