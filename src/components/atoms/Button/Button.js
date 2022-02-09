import styled from 'styled-components';

export const Button = styled.button`
  width: 100px;
  padding: 0.5rem 0.5rem;
  margin: ${({ margin }) => margin};
  border: 1px solid ${({ theme }) => theme.colors.decors.black};
  border-radius: 5px;
  background-color: ${({ theme, isCancel }) =>
    isCancel ? theme.colors.bg.secondary : theme.colors.bg.primary};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: ${({ theme, isCancel }) =>
    isCancel ? theme.fontWeight.regular : theme.fontWeight.bold};
  color: ${({ theme, isCancel }) => (isCancel ? theme.colors.text.black : theme.colors.text.white)};
  cursor: pointer;
  transition: background-color 0.3s ease-in;

  &:hover {
    background-color: ${({ isCancel }) =>
      isCancel ? 'rgba(200, 3, 3, 1)' : 'rgba(0, 164, 16, 1)'};
  }

  &:last-child {
    margin-right: 0;
  }
`;
