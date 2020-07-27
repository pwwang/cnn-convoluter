import React from 'react';

function SettingsDimension({dimty, values, onChange}) {

    return <div className="form-row">
        <div className="col-sm-2">
            <input type="text" className="form-control form-control-sm"
                value={dimty < 3 ? "" : values[0]}
                name="dim0"
                onChange={onChange}
                disabled={dimty < 3} />
        </div>
        <div className="col-sm-1 text-center"> x </div>
        <div className="col-sm-2">
            <input type="text" className="form-control form-control-sm"
                value={dimty < 2 ? "" : values[1]}
                name="dim1"
                onChange={onChange}
                disabled={dimty < 2} />
        </div>
        <div className="col-sm-1 text-center"> x </div>
        <div className="col-sm-2">
            <input type="text" className="form-control form-control-sm"
                name="dim2"
                onChange={onChange}
                value={values[2]} />
        </div>
    </div>;
};

export default SettingsDimension;
