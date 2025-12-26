#!/usr/bin/env python3
"""
Cascadian Armed Forces Automated Intelligence System (CAFAIS)
Main system entry point and coordinator
"""

import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any


class IntelligenceCollector:
    """Collects intelligence data from various sources"""
    
    def __init__(self):
        self.sources = []
        self.collected_data = []
    
    def add_source(self, source_name: str, source_type: str):
        """Add a data source to monitor"""
        self.sources.append({
            'name': source_name,
            'type': source_type,
            'status': 'active',
            'added_at': datetime.now().isoformat()
        })
        logging.info(f"Added intelligence source: {source_name} ({source_type})")
    
    def collect(self) -> List[Dict[str, Any]]:
        """Collect data from all active sources"""
        logging.info(f"Collecting intelligence from {len(self.sources)} sources")
        # Clear previous collection data before new cycle
        current_data = []
        # Simulated collection - in production would interface with real sources
        for source in self.sources:
            if source['status'] == 'active':
                current_data.append({
                    'source': source['name'],
                    'timestamp': datetime.now().isoformat(),
                    'type': source['type'],
                    'status': 'collected'
                })
        self.collected_data = current_data
        return current_data


class ThreatAnalyzer:
    """Analyzes collected intelligence for potential threats"""
    
    def __init__(self):
        self.threat_levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        self.detected_threats = []
    
    def analyze(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze intelligence data for threats"""
        logging.info(f"Analyzing {len(data)} intelligence reports")
        threats = []
        
        for item in data:
            # Simulated threat analysis
            threat = {
                'id': f"THR-{len(threats) + 1:04d}",
                'source': item.get('source', 'unknown'),
                'detected_at': datetime.now().isoformat(),
                'level': 'LOW',  # Default level
                'status': 'identified',
                'description': f"Potential threat from {item.get('type', 'unknown source')}"
            }
            threats.append(threat)
        
        # Update detected threats with current cycle only
        self.detected_threats = threats
        logging.info(f"Identified {len(threats)} potential threats")
        return threats


class ReportGenerator:
    """Generates intelligence reports and alerts"""
    
    def __init__(self, output_dir: Path = None):
        self.output_dir = output_dir or Path('reports')
        self.output_dir.mkdir(exist_ok=True)
    
    def generate_report(self, threats: List[Dict[str, Any]], 
                       sources: List[Dict[str, Any]]) -> str:
        """Generate a comprehensive intelligence report"""
        report_time = datetime.now()
        report_id = f"RPT-{report_time.strftime('%Y%m%d-%H%M%S')}"
        
        report = {
            'report_id': report_id,
            'generated_at': report_time.isoformat(),
            'system': 'CAFAIS',
            'summary': {
                'total_sources': len(sources),
                'active_sources': len([s for s in sources if s.get('status') == 'active']),
                'threats_identified': len(threats),
                'threat_breakdown': self._count_by_level(threats)
            },
            'sources': sources,
            'threats': threats
        }
        
        # Save report to file
        report_file = self.output_dir / f"{report_id}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        logging.info(f"Report generated: {report_file}")
        return str(report_file)
    
    def _count_by_level(self, threats: List[Dict[str, Any]]) -> Dict[str, int]:
        """Count threats by severity level"""
        counts = {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'CRITICAL': 0}
        for threat in threats:
            level = threat.get('level', 'LOW')
            counts[level] += 1
        return counts
    
    def print_summary(self, report_path: str):
        """Print a human-readable summary of the report"""
        with open(report_path, 'r') as f:
            report = json.load(f)
        
        print("\n" + "="*70)
        print(f"CAFAIS INTELLIGENCE REPORT - {report['report_id']}")
        print("="*70)
        print(f"\nGenerated: {report['generated_at']}")
        print(f"\nSOURCE SUMMARY:")
        print(f"  Total Sources: {report['summary']['total_sources']}")
        print(f"  Active Sources: {report['summary']['active_sources']}")
        print(f"\nTHREAT SUMMARY:")
        print(f"  Total Threats Identified: {report['summary']['threats_identified']}")
        print(f"  Threat Levels:")
        for level, count in report['summary']['threat_breakdown'].items():
            print(f"    {level}: {count}")
        print("\n" + "="*70 + "\n")


class CAFAIS:
    """Main Cascadian Armed Forces Automated Intelligence System"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or self._default_config()
        self._setup_logging()
        
        self.collector = IntelligenceCollector()
        self.analyzer = ThreatAnalyzer()
        self.reporter = ReportGenerator()
        
        logging.info("CAFAIS initialized")
    
    def _default_config(self) -> Dict[str, Any]:
        """Return default system configuration"""
        return {
            'system_name': 'CAFAIS',
            'version': '1.0.0',
            'log_level': 'INFO',
            'auto_analyze': True,
            'report_format': 'json'
        }
    
    def _setup_logging(self):
        """Configure system logging"""
        log_level = getattr(logging, self.config.get('log_level', 'INFO'))
        # Only configure if not already configured
        if not logging.getLogger().hasHandlers():
            logging.basicConfig(
                level=log_level,
                format='%(asctime)s - CAFAIS - %(levelname)s - %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
        else:
            # Just update the level if already configured
            logging.getLogger().setLevel(log_level)
    
    def add_intelligence_source(self, name: str, source_type: str):
        """Add a new intelligence source"""
        self.collector.add_source(name, source_type)
    
    def run_intelligence_cycle(self) -> str:
        """Execute a complete intelligence gathering and analysis cycle"""
        logging.info("Starting intelligence cycle")
        
        # Collect intelligence
        data = self.collector.collect()
        
        # Analyze for threats
        threats = self.analyzer.analyze(data)
        
        # Generate report
        report_path = self.reporter.generate_report(threats, self.collector.sources)
        
        # Print summary
        self.reporter.print_summary(report_path)
        
        logging.info("Intelligence cycle completed")
        return report_path
    
    def get_status(self) -> Dict[str, Any]:
        """Get current system status"""
        return {
            'system': self.config['system_name'],
            'version': self.config['version'],
            'status': 'operational',
            'sources': len(self.collector.sources),
            'threats_detected': len(self.analyzer.detected_threats),
            'timestamp': datetime.now().isoformat()
        }


def main():
    """Main entry point for CAFAIS"""
    print("\n" + "="*70)
    print("Cascadian Armed Forces Automated Intelligence System (CAFAIS)")
    print("Version 1.0.0")
    print("="*70 + "\n")
    
    # Initialize the system
    system = CAFAIS()
    
    # Add some example intelligence sources
    system.add_intelligence_source("Satellite Feed Alpha", "satellite")
    system.add_intelligence_source("Ground Sensor Network", "sensor_network")
    system.add_intelligence_source("Communications Intercept", "sigint")
    system.add_intelligence_source("Reconnaissance Reports", "humint")
    
    # Run an intelligence cycle
    print("\nRunning intelligence gathering and analysis cycle...\n")
    report_path = system.run_intelligence_cycle()
    
    # Display system status
    status = system.get_status()
    print(f"System Status: {status['status'].upper()}")
    print(f"Version: {status['version']}")
    print(f"Active Sources: {status['sources']}")
    print(f"Total Threats Detected: {status['threats_detected']}\n")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
