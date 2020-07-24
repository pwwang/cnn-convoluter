import React from 'react';

function Card(props) {
    return (
        <div className="card h-100">
          <div className="card-body h-100">
            <h5 className="card-title">{props.title}</h5>
            {props.children}
          </div>
        </div>
    );
}

export default Card;
