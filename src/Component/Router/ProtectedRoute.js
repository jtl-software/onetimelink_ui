import React from 'react';
import {Route, Redirect} from 'react-router-dom';

export const ProtectedRoute = ({session: Session, ...rest}) => {
    if (Session.isActive()) {
        return (
            <Route
                {...rest}
            />
        );
    }

    return (
        <Redirect
            push
            to={{
                pathname: "/login",
                state: {from: rest.location}
            }}
        />
    );

};