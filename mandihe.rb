def escape_char(c)
  case c
  when "'", '"', "/", "\\", "<", ">"
    "\\u{%x}" % c.ord
  when "\u{20}".."\u{7e}"
    c
  else
    "\\u{%x}" % c.ord
  end
end

def excaped_file(fn)
  s = File.open( fn, &:read )
  s.bytes.map{ |e| escape_char(e.chr) }.join
end
