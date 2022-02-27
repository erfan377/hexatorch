import styled, { css } from "styled-components";
import { ButtonProps } from ".";

const COLOR = {
  primary: css`
    color: #FFF;
    background: linear-gradient(#38384F, #38384F);
    &:hover {
      background: #B1B0B9;
      color: #FFF;
    }
  `,
  secondary: css`
    color: #fff;
    background: linear-gradient(#C61434, #C61434);
    &:hover {
      background: linear-gradient(#DC143C, #DC143C);
    }
  `,
};

const DISABLED = css`
  cursor: not-allowed;
  background: #d4d4d4;
  color: #f5f5f5;
  &:hover {
    background: #d4d4d4;
    color: #f5f5f5;
    box-shadow: none;
  }
`;

export const Container = styled.button<ButtonProps>`
  padding: 10px;
  margin-left: .5rem;
  margin-right: .5rem;
  cursor: pointer;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  outline: none;
  transition: all 0.2s;
  ${(props) => props.color && COLOR[props.color]}
  ${(props) => props.disabled && DISABLED}
`;