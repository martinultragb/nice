import { useEffect } from 'react'
import { useDidShow } from '@tarojs/taro'
import './app.css'
import userStore from './store/userStore'

function App(props: any) {
  useEffect(() => {
    console.log('App mounted')
    userStore.getUser()
  }, [])

  useDidShow(() => {
    console.log('App did show')
  })

  return props.children
}

export default App
