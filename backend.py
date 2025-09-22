import os
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain.memory import ConversationBufferMemory
from langchain.agents import initialize_agent, AgentType
from langchain_community.chat_models import ChatOpenAI
from langchain_community.tools import WikipediaQueryRun, ArxivQueryRun, DuckDuckGoSearchRun
from langchain_community.utilities import WikipediaAPIWrapper, ArxivAPIWrapper, DuckDuckGoSearchAPIWrapper
from langdetect import detect
from deep_translator import GoogleTranslator
from dotenv import load_dotenv, find_dotenv

# Load environment variables
load_dotenv(find_dotenv())

# Initialize FastAPI
app = FastAPI()



# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for frontend requests
class ChatRequest(BaseModel):
    message: str

# --- Initialize AI Tools ---
wiki = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper(top_k_results=1, doc_content_chars_max=200))
arxiv = ArxivQueryRun(api_wrapper=ArxivAPIWrapper(top_k_results=1, doc_content_chars_max=200))
duckduckgo_search = DuckDuckGoSearchRun(api_wrapper=DuckDuckGoSearchAPIWrapper(region="in-en", time="y", max_results=2))
tools = [wiki, arxiv, duckduckgo_search]

# --- Memory ---
chat_memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

# --- LLM Loader ---
def load_llm():
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    return ChatOpenAI(
        model_name="openai/gpt-oss-120b",
        temperature=1,
        openai_api_key=groq_api_key,
        openai_api_base="https://api.groq.com/openai/v1"
    )

# --- Translation ---
def translate_to_english(text):
    try:
        detected_lang = detect(text)
        if detected_lang == "en":
            return text, "en"
        translated_text = GoogleTranslator(source=detected_lang, target="en").translate(text)
        return translated_text, detected_lang
    except:
        return text, "unknown"

def translate_back(text, target_lang):
    try:
        if target_lang == "en":
            return text
        return GoogleTranslator(source="en", target=target_lang).translate(text)
    except:
        return text

def get_conversational_agent():
    llm = load_llm()
    return initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        memory=chat_memory,
        verbose=False,
        return_intermediate_steps=True,
        max_iterations=5,
        handle_parsing_errors=True
    )

def trim_chat_memory(max_length=5):
    chat_history = chat_memory.load_memory_variables({})["chat_history"]
    if len(chat_history) > max_length:
        chat_memory.chat_memory.messages = chat_history[-max_length:]
    return chat_history



@app.post("/chat")
async def chat(req: ChatRequest):
    user_message = req.message
    translated_query, original_lang = translate_to_english(user_message)

    agent = get_conversational_agent()
    trim_chat_memory(max_length=5)

    full_prompt = f"""
            You are a helpful AI assistant for farming questions.
            If the question is not related to agriculture, say "please ask questions related to agriculture only".

            User's Question: {translated_query}
            """

    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = agent.invoke({"input": full_prompt})
            break
        except:
            time.sleep(2)
    else:
        return {"reply": "Error: Could not process your request. Please try again later."}

    response_text = response["output"] if isinstance(response, dict) and "output" in response else str(response)
    final_response = translate_back(response_text, original_lang)
    return {"reply": final_response, "detectedLang": original_lang, "translatedQuery": translated_query}
