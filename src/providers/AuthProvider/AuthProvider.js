import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import uniqid from 'uniqid';
import { auth, db, auth2 } from 'api/firebase/firebase.config';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  query,
  collection,
  getDocs,
  where,
  onSnapshot,
} from 'firebase/firestore';

const AuthContext = React.createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authAdmin, setAuthAdmin] = useState(false);
  const [authUser, setAuthUser] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [appState, setAppState] = useState({ state: 'nonActive', date1: '', date2: '' });

  const _alertError = (error, msg) => window.alert(`${msg || ''} | Error code: ${error.code}`);

  const _getUserRole = async (id) => {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef).catch((error) => {
      throw error;
    });
    return docSnap;
  };

  const _addUser = async ({ firstName, lastName, email }, id) => {
    await setDoc(doc(db, 'users', id), {
      firstName: firstName.toLowerCase(),
      lastName: lastName.toLowerCase(),
      email: email.toLowerCase(),
      role: 'user',
    }).catch((error) => {
      throw error;
    });
  };

  const _addEmployee = async (alias, rolesValues, id) => {
    await setDoc(doc(db, 'employees', id), {
      alias,
      rolesValues,
    }).catch((error) => {
      throw error;
    });
  };

  const _handleCreateUser = (email) => {
    return createUserWithEmailAndPassword(auth2, email, uniqid())
      .then((respond) => {
        signOut(auth2).catch((error) => {
          throw error;
        });
        return respond.user.uid;
      })
      .catch((error) => {
        throw error;
      });
  };

  const logIn = async (email, password) => {
    setInProgress(true);
    await signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setInProgress(false);
        return true;
      })
      .catch((error) => {
        setInProgress(false);
        throw error;
      });
  };

  const logOut = () => {
    signOut(auth)
      .then(() => {
        setAuthAdmin(false);
        setAuthUser(false);
      })
      .catch((error) => {
        _alertError(error, 'Wylogowanie nie powiodło się');
        window.location.reload();
      });
  };

  const resetPassword = async (email) => {
    setInProgress(true);
    const respond = await sendPasswordResetEmail(auth, email)
      .then(() => {
        setInProgress(false);
        return true;
      })
      .catch((error) => {
        setInProgress(false);
        throw error;
      });

    return respond;
  };

  const createUser = async (values, rolesValues) => {
    const q = query(
      collection(db, 'employees'),
      where('alias', '==', `${values.alias.toLowerCase()}`),
    );
    const querySnapshot = await getDocs(q)
      .then((docSnap) => {
        let aliasExist = false;
        docSnap.forEach((item) => {
          aliasExist = item.data().alias === values.alias.toLowerCase();
        });
        if (!aliasExist) {
          _handleCreateUser(values.email.toLowerCase())
            .then((uid) => {
              _addUser(values, uid);
              _addEmployee(values.alias.toLowerCase(), rolesValues, uid);
            })
            .catch((error) => {
              if (error.code === 'auth/email-already-in-use') {
                _alertError(error, 'Podany mail jest już w użyciu');
              } else if (error.code === 'auth/invalid-email') {
                _alertError(error, 'Podany mail jest nie poprawny');
              } else {
                _alertError(error);
              }
            });
        } else {
          throw 'internalError/alias-already-in-use';
        }
      })
      .catch((error) => {
        throw error;
      });

    return querySnapshot;
  };

  const _updateAppState = (id, data) => {
    return setDoc(doc(db, 'statesApp', id), data);
  };

  const handleSetAppState = async (switcher, week) => {
    if (switcher === 'newCycle') {
      await _updateAppState('cycleState', {
        state: 'active',
        date1: week.date1,
        date2: week.date2,
      }).catch((error) => {
        throw error;
      });
    }
    if (switcher === 'blockCycle') {
      await _updateAppState('cycleState', {
        ...appState,
        state: 'blocked',
      }).catch((error) => {
        throw error;
      });
    }
    if (switcher === 'endCycle') {
      await _updateAppState('cycleState', {
        ...appState,
        state: 'nonActive',
      }).catch((error) => {
        throw error;
      });
    }
  };

  useEffect(() => {
    const handleEndSession = () => {
      signOut(auth).catch((error) => console.log(error));
    };
    window.addEventListener('beforeunload', handleEndSession);
    return () => {
      window.removeEventListener('beforeunload', handleEndSession);
    };
  }, []);

  useEffect(() => {
    let unsub = () => {};
    if (authAdmin || authUser) {
      unsub = onSnapshot(doc(db, 'statesApp', 'cycleState'), (item) => {
        setAppState({ ...item.data() });
      });
    }

    return () => {
      unsub();
    };
  }, [authAdmin, authUser]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        _getUserRole(user.uid)
          .then((respond) => {
            setInProgress(false);
            if (respond.data().role === 'admin') {
              setAuthAdmin(true);
            } else if (respond.data().role === 'user') {
              setAuthUser(true);
            } else {
              throw 'Nie znana rola';
            }
          })
          .catch((error) => {
            logOut(auth);
            window.alert(`critical error : ${error}`);
            setInProgress(false);
          });
      } else {
        setCurrentUser(null);
        setInProgress(false);
      }
    });

    return () => {
      unsub();
    };
  }, []);

  const values = {
    currentUser,
    authUser,
    authAdmin,
    inProgress,
    appState,
    logIn,
    logOut,
    createUser,
    resetPassword,
    handleSetAppState,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

AuthProvider.propTypes = {
  children: PropTypes.node,
};
