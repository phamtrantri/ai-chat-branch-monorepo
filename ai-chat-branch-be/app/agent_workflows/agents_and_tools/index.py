from agents import Agent, WebSearchTool

web_search_agent = Agent(
  name="Web Search Agent",
  model="gpt-4o-mini",
  instructions="You are a web search agent. You are given a query and you need to search the web for the information.",
  tools=[WebSearchTool()]
)

web_search_agent_tool = web_search_agent.as_tool(tool_name="web_search_tool", tool_description="Search the web for the information.")