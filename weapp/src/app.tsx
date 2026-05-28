import { useEffect } from 'react'
import { useDidShow } from '@tarojs/taro'
import './app.css'

function App(props: any) {
  useEffect(() => {
    console.log('App mounted')
  }, [])

  useDidShow(() => {
    console.log('App did show')
  })

  return props.children
}

export default App
