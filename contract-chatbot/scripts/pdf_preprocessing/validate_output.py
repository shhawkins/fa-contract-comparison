"""
Validation script to analyze the quality of processed contract JSON
"""
import json
import sys
from collections import Counter

def analyze_json_output(json_path: str):
    """Analyze the processed JSON file and provide quality metrics"""
    
    print(f"📊 Analyzing: {json_path}")
    print("=" * 50)
    
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    # Basic structure validation
    print(f"✅ Document ID: {data.get('id', 'MISSING')}")
    print(f"✅ Document Title: {data.get('title', 'MISSING')}")
    print(f"✅ Total Sections: {len(data.get('sections', []))}")
    
    sections = data.get('sections', [])
    
    if not sections:
        print("❌ No sections found!")
        return
    
    # Analyze section types
    type_counter = Counter(section.get('type', 'unknown') for section in sections)
    print(f"\n📝 Section Types:")
    for section_type, count in type_counter.items():
        print(f"   {section_type}: {count}")
    
    # Analyze categories
    category_counter = Counter()
    importance_counter = Counter()
    glossary_terms_found = 0
    sections_with_keywords = 0
    sections_with_monetary = 0
    sections_with_deadlines = 0
    
    for section in sections:
        metadata = section.get('metadata', {})
        
        category = metadata.get('category', 'unknown')
        category_counter[category] += 1
        
        importance = metadata.get('importance', 'unknown')
        importance_counter[importance] += 1
        
        if metadata.get('glossaryTerms'):
            glossary_terms_found += 1
        
        if metadata.get('keywords'):
            sections_with_keywords += 1
            
        if metadata.get('containsMonetaryInfo'):
            sections_with_monetary += 1
            
        if metadata.get('containsDeadlines'):
            sections_with_deadlines += 1
    
    print(f"\n🏷️ Categories:")
    for category, count in category_counter.items():
        percentage = (count / len(sections)) * 100
        print(f"   {category}: {count} ({percentage:.1f}%)")
    
    print(f"\n⭐ Importance Levels:")
    for importance, count in importance_counter.items():
        percentage = (count / len(sections)) * 100
        print(f"   {importance}: {count} ({percentage:.1f}%)")
    
    print(f"\n🔍 Enrichment Quality:")
    print(f"   Sections with glossary terms: {glossary_terms_found} ({(glossary_terms_found/len(sections)*100):.1f}%)")
    print(f"   Sections with keywords: {sections_with_keywords} ({(sections_with_keywords/len(sections)*100):.1f}%)")
    print(f"   Sections with monetary info: {sections_with_monetary} ({(sections_with_monetary/len(sections)*100):.1f}%)")
    print(f"   Sections with deadlines: {sections_with_deadlines} ({(sections_with_deadlines/len(sections)*100):.1f}%)")
    
    # Sample some content for manual review
    print(f"\n📋 Sample Sections for Manual Review:")
    print("-" * 40)
    
    # Find examples of different categories
    examples = {}
    for section in sections:
        metadata = section.get('metadata', {})
        category = metadata.get('category', 'general')
        
        if category not in examples and len(section.get('content', '')) > 50:
            examples[category] = section
    
    for category, section in examples.items():
        content = section.get('content', '')[:200] + "..." if len(section.get('content', '')) > 200 else section.get('content', '')
        glossary_terms = section.get('metadata', {}).get('glossaryTerms', [])
        importance = section.get('metadata', {}).get('importance', 'unknown')
        
        print(f"\n{category.upper()} (Importance: {importance}):")
        print(f"   Content: {content}")
        if glossary_terms:
            print(f"   Glossary Terms: {', '.join(glossary_terms)}")
    
    print(f"\n✅ Validation Complete!")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        json_path = sys.argv[1]
    else:
        json_path = "public/documents/contractA.json"
    
    analyze_json_output(json_path) 