import { FC, ReactNode } from 'react';
import { FC, ReactElement } from 'react'
import X, { Y } from 'Z'

function A({ a }: Other) {
  return <span></span>
}

export const B: FC<SomeProps> = (
  {
    a,
    b
  }
) => {
  return <span></span>
};

export function BB<T>({ a, b }: SomeProps<T>) {
  return <span></span>
}

const C = () => {
  return <div></div>
}

export const D: FC<Props> = (
  {
    d
  }
) => {
  return <div></div>
}

const E: FC<SomeProps> = (
  {
    e
  }
) => {
  return <div></div>
}

const F = <T extends U>({ f }: Props<T>) => {
  return <a></a>
}
