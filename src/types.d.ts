declare module 'animal-island-ui/style' {
  const content: string
  export default content
}

declare module 'animal-island-ui' {
  import React from 'react'

  export interface CodeBlockProps {
    code: string
    style?: React.CSSProperties
    className?: string
  }
  export const CodeBlock: React.FC<CodeBlockProps>

  export interface ButtonProps {
    type?: 'primary' | 'default' | 'text' | 'link'
    size?: 'small' | 'middle' | 'large'
    loading?: boolean
    disabled?: boolean
    onClick?: () => void
    children?: React.ReactNode
    style?: React.CSSProperties
    className?: string
  }
  export const Button: React.FC<ButtonProps>

  export interface CardProps {
    color?: string
    children?: React.ReactNode
    style?: React.CSSProperties
    className?: string
  }
  export const Card: React.FC<CardProps>

  export interface InputProps {
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    style?: React.CSSProperties
    className?: string
  }
  export const Input: React.FC<InputProps>

  export interface SwitchProps {
    checked?: boolean
    onChange?: (checked: boolean) => void
    style?: React.CSSProperties
    className?: string
  }
  export const Switch: React.FC<SwitchProps>

  export interface ModalProps {
    open?: boolean
    onClose?: () => void
    title?: string
    children?: React.ReactNode
    style?: React.CSSProperties
    className?: string
  }
  export const Modal: React.FC<ModalProps>
}
