import MYSQLIcon from './assets/images/canal/MYSQL.svg';
import ElasticSearch from './assets/images/canal/ElasticSearch.svg';
import OracleIcon from './assets/images/canal/Oracle.svg';
import StarRocks from './assets/images/canal/StarRocks.svg';
import PostgreSQL from './assets/images/canal/PostgreSQL.svg';
import KafkaIcon from './assets/images/canal/Kafka.svg';
import Redis from './assets/images/canal/Redis.svg';

const ROBOT_FETCH_URL = 'https://aibot.clougence.com/api/chat/stream'

const DOCUMENT_LINK = 'https://www.clougence.com/cc-doc/intro/product_intro?src=clougence'
const DOCUMENT_SUPPORT_LINK = 'https://www.clougence.com/cc-doc/dataMigrationAndSync/connection/mysql2?target=MySQL'

const SUPPORT_CONNECTION_LIST_MAP = [
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

const QUICK_MSG_MARK = {
  SERVICE: '联系我们',
  QUICKSTART: '快速上手',
  SUPPORT_LINK: '支持链路'
}

const DEFAULT_QUICK_REPLAY = [
  {
    icon: 'message',
    name: QUICK_MSG_MARK.SERVICE,
    isNew: false,
    isHighlight: true,
  },
  {
    icon: 'file',
    name: QUICK_MSG_MARK.QUICKSTART,
    isNew: false,
    isHighlight: true,
  },
  {
    icon: 'file',
    name: QUICK_MSG_MARK.SUPPORT_LINK,
    isNew: true,
    isHighlight: true,
  }
];

export {
  QUICK_MSG_MARK,
  ROBOT_FETCH_URL,
  DEFAULT_QUICK_REPLAY,
  DOCUMENT_LINK,
  DOCUMENT_SUPPORT_LINK,
  SUPPORT_CONNECTION_LIST_MAP
}
