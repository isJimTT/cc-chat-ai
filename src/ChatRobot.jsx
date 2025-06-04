import Chat, { TypingBubble, Bubble, useMessages, Typing, Video, Card, CardMedia, CardTitle, CardText, Think } from '@chatui/core';
import {
  QUICK_MSG_MARK,
  DEFAULT_QUICK_REPLAY,
  ROBOT_FETCH_URL as ROBOT_FETCH_URL_DEFAULT,
  DOCUMENT_LINK as DOCUMENT_LINK_DEFAULT,
  DOCUMENT_SUPPORT_LINK as DOCUMENT_SUPPORT_LINK_DEFAULT,
} from './constant';
import ConnectionList from './FllowConnection';
import React, { useEffect, useState, useRef } from 'react';
import MarkdownIt from 'markdown-it/dist/markdown-it.js';
import { v4 as uuidv4 } from 'uuid';
import hljs from 'highlight.js';

import 'highlight.js/styles/arduino-light.css';
import '@chatui/core/dist/index.css';
import './index.css';

import robotIcon from './assets/images/robot/clougence-icon.svg';
import userAvatar from './assets/images/robot/head.png';
import quickstartImage from './assets/images/robot/login-bg.png';
import wechatImage from './assets/canal/wechat.png';

import MYSQLIcon from './assets/images/canal/MYSQL.svg';
import ElasticSearch from './assets/images/canal/ElasticSearch.svg';
import OracleIcon from './assets/images/canal/Oracle.svg';
import StarRocks from './assets/images/canal/StarRocks.svg';
import PostgreSQL from './assets/images/canal/PostgreSQL.svg';
import KafkaIcon from './assets/images/canal/Kafka.svg';
import Redis from './assets/images/canal/Redis.svg';

const SUPPORT_CONNECTION_LIST_MAP_DEFAULT = [
  {
    form: {
      type: 'Mysql',
      icon: MYSQLIcon
    },
    to: {
      type: 'ElasticSearch',
      icon: ElasticSearch
    }
  },
  {
    form: {
      type: 'OracleIcon',
      icon: OracleIcon
    },
    to: {
      type: 'StarRocks',
      icon: StarRocks
    }
  },
  {
    form: {
      type: 'PostgreSQL',
      icon: PostgreSQL
    },
    to: {
      type: 'Kafka',
      icon: KafkaIcon
    }
  },
  {
    form: {
      type: 'Redis',
      icon: Redis
    },
    to: {
      type: 'Redis',
      icon: Redis
    }
  },
]

const INIT_MESSAGES = [
  {
    type: 'system',
    content: { text: 'ClouGence AI 智能助手 为您服务' },
  },
  {
    type: 'text',
    content: { text: 'Hi，我是你的专属智能助理，有问题请随时找我哦~' },
    class: 'greeting',
    user: {
      avatar: robotIcon,
    },
  },
];


const md = new MarkdownIt({
  linkify: true,
  typographer:  false,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
      } catch (_) { }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const aIndex = tokens[idx].attrIndex('target');
  if (aIndex < 0) {
    tokens[idx].attrPush(['target', '_blank']);
  } else {
    tokens[idx].attrs[aIndex][1] = '_blank';
  }
  return self.renderToken(tokens, idx, options);
};

function generateUniqueId() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
}

function parseThinkContent(text = '') {
  const thinkStart = text.indexOf('<think>');
  const thinkEnd = text.indexOf('</think>');

  if (thinkStart !== -1 && thinkEnd !== -1 && thinkEnd > thinkStart) {
    const thinkContent = text.slice(thinkStart + 7, thinkEnd);
    const restContent = text.slice(thinkEnd + 8);
    return { thinkContent, restContent, inThink: false };
  } else if (thinkStart !== -1 && (thinkEnd === -1 || thinkEnd < thinkStart)) {
    const thinkContent = text.slice(thinkStart + 7);
    return { thinkContent, restContent: '', inThink: true };
  } else {
    return { thinkContent: '', restContent: text, inThink: false };
  }
}


const ChatRobot = ({
  onClose = null,
  onExpand = null,
  ROBOT_FETCH_URL = ROBOT_FETCH_URL_DEFAULT,
  DOCUMENT_LINK = DOCUMENT_LINK_DEFAULT,
  DOCUMENT_SUPPORT_LINK = DOCUMENT_SUPPORT_LINK_DEFAULT,
  SUPPORT_CONNECTION_LIST_MAP = SUPPORT_CONNECTION_LIST_MAP_DEFAULT
}) => {
  const { messages, appendMsg, updateMsg, resetList } = useMessages(INIT_MESSAGES);
  const [userMessageList, setUserMessageList] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isExpand, setIsExpand] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const [sessionId, setSessionId] = useState(() => initSessionId());
  const inputRef = useRef(null);

  function navRightClick() {
    setMenuVisible(!menuVisible);
  }

  function cleanChat() {
    localStorage.removeItem(sessionId);
    localStorage.removeItem('sessionId');
    resetList();
    setUserMessageList([]);
    appendMsg({
      type: 'system',
      content: { text: 'ClouGence AI 智能助手 为您服务' },
    });
    appendMsg({
      type: 'text',
      content: { text: 'Hi，我是你的专属智能助理，有问题请随时找我哦~' },
      class: 'greeting',
      user: {
        avatar: robotIcon,
      },
    });
    setSessionId(initSessionId());
  }

  function getChatNavbar() {
    return {
      title: 'CloudCanal 技术支持',
      logo: robotIcon,
      align: 'left',
      rightContent: [
        {
          icon: 'chevron-down',
          onClick: navRightClick,
          className: `expanding ${menuVisible ? 'rotate' : 'rotate-back'}`
        },
      ],
    };
  }

  function initSessionId() {
    let storedId = localStorage.getItem('sessionId');
    if (!storedId) {
      const newId = uuidv4();
      localStorage.setItem('sessionId', JSON.stringify(newId));
      return newId;
    } else {
      return JSON.parse(storedId);
    }
  }

  function getCacheChat(uuid) {
    const stored = localStorage.getItem(uuid);
    if (stored) {
      const parse = JSON.parse(stored);
      setUserMessageList(parse);
      parse.forEach(msg => {
        appendMsg({
          type: 'text',
          content: msg.content,
          position: msg.role === 'user' ? 'right' : 'left',
          user: {
            avatar: msg.role === 'user' ? userAvatar : robotIcon,
          },
        });
      });
    }
  }

  async function getRepeatMessage(msgID, msgs) {
  try {
    const res = await fetch(ROBOT_FETCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        message: msgs[msgs.length - 1]?.content?.text,
        sessionId,
      }),
    });
    const contentType = res.headers.get('Content-Type') || '';

    if (!res.ok || !res.body || !contentType.includes('text/event-stream')) {
      let errorMessage = 'Unexpected response';
      try {
        const errorData = await res.json();
        errorMessage = errorData?.msg || errorMessage;
      } catch (parseErr) {
        console.warn('解析错误响应 JSON 失败:', parseErr);
      }
      throw new Error(errorMessage);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let fullText = '';
    let textBuffer = '';
    let contentBuffer = '';

    const flushBuffer = () => {
      if (!contentBuffer) return;
      fullText += contentBuffer;
      contentBuffer = '';
      updateMsg(msgID, {
        type: 'text',
        content: { text: fullText },
        user: {
          avatar: robotIcon,
        },
      });
      setUserMessageList(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant') {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...last,
            content: { text: fullText },
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              role: 'assistant',
              type: 'text',
              content: { text: fullText },
            },
          ];
        }
      });
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        flushBuffer();
        setCanSend(true);
        fullText = fullText.trim();
        fullText = fullText.replace(':::', '');
        fullText = fullText.replace(':::info', '');
        console.warn(111, fullText);
        setUserMessageList(prev => [
          ...prev,
          {
            role: 'assistant',
            type: 'text',
            content: { text: fullText },
          },
        ]);
        break;
      }

      textBuffer += decoder.decode(value, { stream: true });

      // 只处理完整的行，流式数据可能被折行
      const lines = textBuffer.split('\n');
      textBuffer = lines.pop();

      for (const line of lines) {
        if (!line.trim().startsWith('data:')) continue;
        const jsonStr = line.replace(/^data:\s*/, '');
        if (jsonStr === '[DONE]') continue;

        try {
          const data = JSON.parse(jsonStr);
          const delta = data?.content || '';
          if (delta) {
              contentBuffer += delta;
              if (contentBuffer.length > 2) {
                flushBuffer();
              }
            }
        } catch (err) {
          console.warn('JSON 解析失败:', err, jsonStr);
        }
      }

      await new Promise(r => setTimeout(r, 30));
    }
  } catch (err) {
    console.warn(11, err?.message);

    updateMsg(msgID, {
      type: 'text',
      content: { text: err?.message },
      user: {
        avatar: robotIcon,
      },
    });
    setUserMessageList(prev => [
      ...prev,
      {
        role: 'assistant',
        type: 'text',
        content: { text: err?.message },
      },
    ]);
  } finally {
    setIsTyping(false);
    setCanSend(true);
  }
  }

  async function handleSend(type, val) {
    if (!canSend) {
      Promise.resolve().then(() => {
        inputRef?.current?.setText(val);
      });
      return;
    }
    if (type === 'text' && val.trim()) {
      const msgID = generateUniqueId();
      setCanSend(false);

      appendMsg({
        type: 'text',
        content: { text: val },
        position: 'right',
        user: {
          avatar: userAvatar,
        },
      });

      const msgs = [...userMessageList, {
        role: 'user', type: 'text', content: {
          text: val
        }
      }];
      setUserMessageList(msgs);
      setIsTyping(true);

      appendMsg({
        _id: msgID,
        type: 'text',
        content: { text: '...' },
        user: {
          avatar: robotIcon,
        },
      });

      await getRepeatMessage(msgID, msgs);
    }
  }

  function handleQuickReplyClick(item) {
    appendMsg({
      type: 'text',
      content: { text: item?.name },
      position: 'right',
      user: {
        avatar: userAvatar,
      },
    });
    setIsTyping(true);

    switch (item?.name) {
      case QUICK_MSG_MARK.SERVICE:
        appendMsg({
          type: 'text',
          user: {
            avatar: robotIcon,
          },
          mark: 'quick-service',
        });
        break;
      case QUICK_MSG_MARK.QUICKSTART:
        appendMsg({
          type: 'text',
          user: {
            avatar: robotIcon,
          },
          mark: 'quick-quickstart',
        });
        break;
      case QUICK_MSG_MARK.SUPPORT_LINK:
        appendMsg({
          type: 'text',
          user: {
            avatar: robotIcon,
          },
          mark: 'quick-support-link',
        });
        break;
      default:
        break;
    }

    setTimeout(() => {
      setIsTyping(false);
      const scroller = document.querySelector('.PullToRefresh');
      if (scroller) {
        scroller.scrollTo({
          top: scroller.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 1000);
  }

  function renderMessageContent(msg) {
    const lastMsg = messages[messages.length - 1];
    const isLastTyping = msg?._id === lastMsg?._id && isTyping;

    // 1、快速回复render
    if (msg?.mark === 'quick-service') {
      return isLastTyping ? (
        <Typing />
      ) : (
        <Card fluid style={{ paddingTop: '10px' }}>
          <CardMedia
            aspectRatio="wide"
            image={wechatImage}
          />
          <CardTitle>联系方式</CardTitle>
          <CardText>商业洽谈：0571-88603096</CardText>
          <CardText>邮箱：hr@clougence.com</CardText>
        </Card>
      );
    }
    if (msg?.mark === 'quick-quickstart') {
      return isLastTyping ? (
        <Typing />
      ) : (
        <Card fluid className="quickstart-card">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={quickstartImage} alt="quickstart" className='card-img-wrap' />
            <div>
              <CardTitle>
                <a href={DOCUMENT_LINK} style={{ fontSize: 16, marginBottom: 6 }} target="_blank">快速开始指南</a>
              </CardTitle>
              <CardText style={{ fontSize: 14, color: '#666' }}>
                点击查看 CloudCanal 的使用文档和快速上手步骤。
              </CardText>
            </div>
          </div>
        </Card>
      );
    }
    if (msg?.mark === 'quick-support-link') {
      return isLastTyping ? (
        <Typing />
      ) : (
        <Card fluid className="quickstart-card">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              <CardTitle>
                以下为热门链路, 更多链路支持请说出你的需求，或者自行
                <a href={DOCUMENT_SUPPORT_LINK} target='__blank'>查阅文档</a>
              </CardTitle>
              <ConnectionList connectionList={SUPPORT_CONNECTION_LIST_MAP} />
            </div>
          </div>
        </Card>
      );
    }

    // 2、招呼语 render
    if (msg?.class === 'greeting') {
      return <TypingBubble content={msg?.content?.text} />
    }

    // 3、Typing render
    if (msg?.content?.text === '...') {
      return <Typing />
    }


    // 4、流式MD render + thinking render
    const text = msg.content?.text || '';
    const { thinkContent, restContent } = parseThinkContent(text);

    return (
      <Bubble>
        {(msg?.position === 'left' && text.indexOf('<think>') !== -1) && <Think>
          {thinkContent.trim()}
        </Think>}
        <div className="parse-content"
          dangerouslySetInnerHTML={{ __html: md.render(restContent).trim() }}
        />
      </Bubble>
    );
  }

  useEffect(() => {
    // 渲染缓存会话
    getCacheChat(sessionId);

    // 关闭右上角菜单
    function handleClickOutside(e) {
      if (
        !e.target.closest('.Icon')
      ) {
        setMenuVisible(false);
      }
    }
    document.addEventListener('click', handleClickOutside);

    // 内部引入图标库资源
    const script = document.createElement('script');
    script.src = 'https://g.alicdn.com/chatui/icons/2.6.2/index.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // 监听 userMessageList 变化 -> 存储到 localStorage
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(sessionId, JSON.stringify(userMessageList));
    }
  }, [userMessageList]);

  return (
    <div className='chat-wrap'>
      <Chat
        navbar={getChatNavbar()}
        messages={messages}
        renderMessageContent={renderMessageContent}
        quickReplies={DEFAULT_QUICK_REPLAY}
        onQuickReplyClick={handleQuickReplyClick}
        onSend={handleSend}
        composerRef={inputRef}
      />
      {menuVisible && (
        <div className="chat-dropdown-menu">
          <div className={onClose ? "menu-item" : 'menu-item disabled'} onClick={() => { setMenuVisible(false); onClose(); }}>
            最小化窗口
          </div>
          <div className={onExpand ? "menu-item" : 'menu-item disabled'} onClick={() => { setMenuVisible(false); setIsExpand(!isExpand); onExpand(); }}>
            {isExpand ? '退出全屏' : '全屏'}
          </div>
          <div className={"menu-item"} onClick={() => { setMenuVisible(false); cleanChat(); }}>
            清除会话
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRobot;
