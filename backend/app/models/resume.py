from pydantic import BaseModel


class ParsedSection(BaseModel):
    title: str
    content: list[str]


class ParsedResume(BaseModel):
    filename: str
    file_type: str
    raw_text: str
    sections: list[ParsedSection]
    metadata: dict
