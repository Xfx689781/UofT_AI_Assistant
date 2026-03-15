// 在你的 Chat 组件内获取 profile
const [profile, setProfile] = useState(null)

useEffect(() => {
  const savedData = localStorage.getItem('onboarding_data') // 确保这里的 key 和你存储时一致
  if (savedData) setProfile(JSON.parse(savedData))
}, [])

// 修改发送消息的函数
async function sendMessage(userMessage: string) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [...chatHistory, { role: 'user', content: userMessage }],
      studentProfile: profile // 关键：把画像传给后端
    }),
  })
  // ... 后续逻辑
}
