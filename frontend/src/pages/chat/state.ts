import { Observable } from 'rxjs';
import { create } from 'zustand';
import { ConversationDto, FileDto, MessageDto, StreamEventDto } from 'src/api';

export type ChatMessage =
  | MessageDto
  | {
      content: Observable<StreamEventDto>;
    };

interface ChatState {
  // All chat messages.
  messages: ChatMessage[];

  // The conversation.
  conversation: ConversationDto;

  // Indicates if a response is currently running.
  running?: boolean;

  // Adds a new message to the state.
  addMessage: (message: ChatMessage) => void;

  // Sets all messages.
  setMessages: (messages: ChatMessage[]) => void;

  // Sets the conversation.
  setConversation: (conversation: ConversationDto) => void;

  // Updates the running state.
  setRunning: (running: boolean) => void;
}

interface ConversationsState {
  // The conversations.
  conversations: ConversationDto[];

  // Adds or sets a conversation.
  setConversation: (conversation: ConversationDto) => void;

  // Sets all conversations.
  setConversations: (conversations: ConversationDto[]) => void;

  // Remove a conversation.
  removeConversation: (id: number) => void;
}

interface UserFilesState {
  // The files.
  files: FileDto[];

  // Adds or sets an file.
  setFile: (file: FileDto) => void;

  // Sets all files.
  setFiles: (source: FileDto[]) => void;

  // Remove an file.
  removeFile: (id: number) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  conversation: { id: 0 } as any,
  messages: [],
  addMessage: (message: ChatMessage) => {
    return set((state) => ({ messages: [...state.messages, message] }));
  },
  setMessages: (messages: ChatMessage[]) => {
    return set({ messages, running: false });
  },
  setConversation: (conversation: ConversationDto) => {
    return set({ conversation });
  },
  setRunning: (running: boolean) => {
    return set({ running });
  },
}));

export const useConversationsStore = create<ConversationsState>()((set) => ({
  conversations: [],
  setConversation: (conversation: ConversationDto) => {
    return set((state) => {
      const conversations = [...state.conversations];

      const indexOfExisting = conversations.findIndex((x) => x.id === conversation.id);
      if (indexOfExisting >= 0) {
        conversations[indexOfExisting] = conversation;
      } else {
        conversations.push(conversation);
      }

      return { conversations };
    });
  },
  setConversations: (conversations: ConversationDto[]) => {
    return set({ conversations });
  },
  removeConversation: (id: number) => {
    return set((state) => ({ conversations: state.conversations.filter((x) => x.id !== id) }));
  },
}));

export const useUserFilesStore = create<UserFilesState>()((set) => ({
  specs: [],
  files: [],
  setFile: (file: FileDto) => {
    return set((state) => {
      const files = [...state.files];

      const indexOfExisting = state.files.findIndex((x) => x.id === file.id);
      if (indexOfExisting >= 0) {
        files[indexOfExisting] = file;
      } else {
        files.push(file);
      }

      return { files };
    });
  },
  setFiles: (files: FileDto[]) => {
    return set({ files });
  },
  removeFile: (id: number) => {
    return set((state) => ({ files: state.files.filter((x) => x.id !== id) }));
  },
}));
