import { ReactNode } from 'react'
import { FC, ReactElement } from 'react'
import X, { Y } from 'Z'

function A({ a }: Other) {
  return <span></span>
}

export function B({ a, b }: SomeProps) {
  return <span></span>
}

export function BB<T>({ a, b }: SomeProps<T>) {
  return <span></span>
}

const C = () => {
  return <div></div>
}

export const D = ({ d }: Props) => {
  return <div></div>
}

const E = ({ e }: SomeProps) => {
  return <div></div>
}

const F = <T extends U>({ f }: Props<T>) => {
  return <a></a>
}
