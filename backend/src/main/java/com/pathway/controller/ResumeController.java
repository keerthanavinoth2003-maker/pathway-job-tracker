package com.pathway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController @RequestMapping("/api/resume")
public class ResumeController {
    private static final Set<String> ALLOWED = Set.of("java","spring boot","spring","mysql","postgresql","rest api","git","docker","junit","mockito","react","javascript","typescript","aws","azure","kubernetes","microservices","sql","html","css","python","communication","agile","maven");
    @PostMapping("/analyze") public Map<String,Object> analyze(@RequestParam("resume") MultipartFile resume,@RequestParam("jobDescription") String jobDescription) throws IOException {
        if(resume.isEmpty() || resume.getSize()>5_000_000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Upload a non-empty resume smaller than 5 MB.");
        String filename=Objects.toString(resume.getOriginalFilename(),"").toLowerCase(Locale.ROOT);
        String contentType=Objects.toString(resume.getContentType(),"");
        if(!filename.endsWith(".txt")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"For this starter version, upload a .txt resume. PDF/DOCX parsing is a planned extension.");
        String text=new String(resume.getBytes(),StandardCharsets.UTF_8).toLowerCase(Locale.ROOT);
        Set<String> found=ALLOWED.stream().filter(s->Pattern.compile("\\\\b"+Pattern.quote(s)+"\\\\b",Pattern.CASE_INSENSITIVE).matcher(text).find()).collect(Collectors.toCollection(TreeSet::new));
        Set<String> required=ALLOWED.stream().filter(s->Pattern.compile("\\\\b"+Pattern.quote(s)+"\\\\b",Pattern.CASE_INSENSITIVE).matcher(jobDescription).find()).collect(Collectors.toCollection(TreeSet::new));
        Set<String> matched=new TreeSet<>(found);matched.retainAll(required);
        Set<String> missing=new TreeSet<>(required);missing.removeAll(found);
        int score=required.isEmpty()?0:(int)Math.round(100.0*matched.size()/required.size());
        List<String> checks=new ArrayList<>();
        for(String heading:List.of("experience","education","skills","projects")) checks.add(heading.substring(0,1).toUpperCase()+heading.substring(1)+": "+(text.contains(heading)?"found":"review"));
        return Map.of("estimatedKeywordMatch",score,"matchedSkills",matched,"missingSkills",missing,"resumeChecklist",checks,
            "disclaimer","Heuristic keyword comparison only; not an employer ATS score or hiring prediction.");
    }
}
