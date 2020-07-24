import React from 'react';

function SettingsDimension(props) {

    return <div className="form-row">
        <div className="col-sm-2">
            <input type="text" className="form-control form-control-sm"
                value={props.dimty < 3 ? "" : props.values[props.values.length - 3]}
                name={"dim" + (props.dimty - 2)}
                onChange={props.onChange}
                disabled={props.dimty < 3} />
        </div>
        <div className="col-sm-1 text-center"> x </div>
        <div className="col-sm-2">
            <input type="text" className="form-control form-control-sm"
                value={props.dimty < 2 ? "" : props.values[props.values.length  - 2]}
                name={"dim" + (props.dimty - 1)}
                onChange={props.onChange}
                disabled={props.dimty < 2} />
        </div>
        <div className="col-sm-1 text-center"> x </div>
        <div className="col-sm-2">
            <input type="text" className="form-control form-control-sm"
                name={"dim" + props.dimty}
                onChange={props.onChange}
                value={props.values[props.values.length - 1]} />
        </div>
    </div>;
};

export default SettingsDimension;
