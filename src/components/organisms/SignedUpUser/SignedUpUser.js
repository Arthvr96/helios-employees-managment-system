import React, { useState } from 'react';
import { useAuth } from 'providers/AuthProvider/AuthProvider';
import { ArrowIcone } from 'components/atoms/ArowIcone/ArowIcone';
import { UserAvatar } from 'components/atoms/UserAvatar/UserAvatar';
import {
  UserNavWrapper,
  User,
  UserInfoWrapper,
  UserName,
  UserRoleName,
  UserMenu,
  LinkButton,
} from './SignedUpUser.style';

const SignedUpUser = () => {
  const [isOpen, setOpen] = useState(false);
  const { currentUser, logOut } = useAuth();
  const { email, firstName, lastName } = currentUser;

  return (
    <UserNavWrapper className="signedUpUser">
      <User onClick={() => setOpen(!isOpen)}>
        <UserInfoWrapper>
          <UserName>{email && email}</UserName>
          <UserRoleName>admin</UserRoleName>
        </UserInfoWrapper>
        <UserAvatar>
          <span>{firstName && firstName.slice(0, 3)}</span>
          <span>{lastName && lastName.slice(0, 3)}</span>
        </UserAvatar>
        <ArrowIcone isRotate={isOpen} isReversed />
      </User>
      <UserMenu isOpen={isOpen}>
        <div>
          <LinkButton type="button">Ustawienia</LinkButton>
          <LinkButton type="button" onClick={logOut}>
            Wyloguj
          </LinkButton>
        </div>
      </UserMenu>
    </UserNavWrapper>
  );
};

export default SignedUpUser;
