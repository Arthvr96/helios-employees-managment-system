import React, { useEffect, Suspense, lazy } from 'react';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { useAuth } from 'providers/AuthProvider/AuthProvider';
import LoaderRing from 'components/atoms/LoaderRing/LoaderRing';
import ViewTemplate from 'components/templates/ViewTemplate/ViewTemplate';
import LoginPanel from 'components/views/LoginPanel/LoginPanel';
import Site404 from 'components/templates/Site404/Site404';

const AdminPanel = lazy(() => import('components/views/AdminPanel/AdminPanel'));
const UserPanel = lazy(() => import('components/views/UserPanel/UserPanel'));

const PanelsWrapper = () => {
  const { authUser, authAdmin, currentUser } = useAuth();
  const history = useHistory();

  const goToRoute = (routeName) => {
    history.push(routeName);
  };

  useEffect(() => {
    if (authAdmin && currentUser) {
      goToRoute('/admin/dashboard');
    }
    if (authUser && currentUser) {
      goToRoute('/user/disposition');
    }
    if (!authUser && !authAdmin && !currentUser) {
      goToRoute('/login');
    }
  }, [authUser, authAdmin, currentUser]);

  return (
    <Suspense
      fallback={
        <ViewTemplate alignItems="center" justifyContent="center">
          <LoaderRing />
        </ViewTemplate>
      }
    >
      <Switch>
        <Route exact path="/login">
          <LoginPanel />
        </Route>
        {authAdmin && currentUser ? <AdminPanel /> : null}
        {authUser && currentUser ? <UserPanel /> : null}
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
        <Route exact path="/404" />
        <Site404 reDirect={() => goToRoute('/login')} />
        <Route path="*">
          <Redirect to="/404" />
        </Route>
      </Switch>
    </Suspense>
  );
};

export default PanelsWrapper;
